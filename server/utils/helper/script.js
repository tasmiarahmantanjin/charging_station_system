import pool from "../../config/database.js";

export const getStationAndAssociationsByStationId = async (stationId) => {
  try {
    const station = await pool.query(
      `SELECT
        s.id,
        s.name,
        s.company_id,
        s.type_id,
        st.name AS station_type,
        st.maxpower AS maxpower,
        cs.charging AS isCharging,
        json_agg(
          json_build_object(
            'id', st.id,
            'name', st.name,
            'maxpower', st.maxpower
          )
        ) AS type,
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'parentCompanyId', c.parent_id
          )
        ) AS company,
        json_agg(
          json_build_object(
            'id', cs.id,
            'station_id', cs.station_id,
            'ischarging', cs.charging
          )
        ) AS chargingstate
    FROM station s
    LEFT JOIN stationtype st ON s.type_id = st.id
    LEFT JOIN company c ON s.company_id = c.id
    LEFT JOIN chargingstate cs ON s.id = cs.station_id
    WHERE s.id = $1
    GROUP BY s.id, s.name, s.company_id, st.name, st.maxpower, cs.charging
    ORDER BY s.id;`,
      [stationId]
    );

    return station.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching station and associations");
  }
};

// Helper function to calculate charging state data
export const calculateChargingStateData = async () => {
  try {
    const query = `SELECT
              company.id,
              ARRAY_AGG(DISTINCT chargingactivity.station_id) AS chargingstations,
              SUM(DISTINCT chargingactivity.chargingpower) AS chargingpower
          FROM
              company
              JOIN chargingactivity ON chargingactivity.company_id = company.id
          WHERE
              chargingactivity.ischarging = true
          GROUP BY
              company.id

          UNION

          SELECT
              parent_company.id,
              ARRAY_AGG(DISTINCT chargingactivity.station_id) AS chargingstations,
              SUM(chargingactivity.chargingpower) AS chargingpower
          FROM
              company AS child_company
              JOIN chargingactivity ON chargingactivity.company_id = child_company.id
              JOIN company AS parent_company ON parent_company.id = child_company.parent_id
          WHERE
              chargingactivity.ischarging = true
          GROUP BY
              parent_company.id;`;

    const response = await pool.query(query);

    const companies = response.rows.reduce((accumulator, currentCompany) => {
      const { id, chargingstations, chargingpower } = currentCompany;

      if (!accumulator[id]) {
        accumulator[id] = {
          id,
          chargingstations,
          chargingpower: parseInt(chargingpower),
        };
      } else {
        accumulator[id].chargingstations = [
          ...new Set([
            ...accumulator[id].chargingstations,
            ...chargingstations,
          ]),
        ];
        accumulator[id].chargingpower += parseInt(chargingpower);
      }

      return accumulator;
    }, {});

    const totalChargingStations = Array.from(
      new Set(
        Object.values(companies).flatMap((company) => company.chargingstations)
      )
    );

    // TODO: make it dynamic,
    // get the station maxpower for stationIds from database and calculate the totalChargingPower
    const totalChargingPower = totalChargingStations.length * 10;

    return {
      // timestamp: Date.now(),
      // timestamp: new Date() + 5 seconds,
      timestamp: new Date().getTime(),
      companies: Object.values(companies),
      totalChargingStations,
      totalChargingPower,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error calculating charging state data");
  }
};

export const getAllStations = async () => {
  try {
    const query = `SELECT
                      s.id,
                      s.name,
                      s.company_id,
                      s.type_id,
                      json_agg(
                        json_build_object(
                          'id', st.id,
                          'name', st.name,
                          'maxpower', st.maxpower
                          )
                        ) AS type
                      FROM station s
                      INNER JOIN stationtype st ON s.type_id = st.id
                      GROUP BY s.id, s.name, s.company_id, s.type_id
                      ORDER BY s.id;`;

    const stations = await pool.query(query);
    return stations.rows;
  } catch (error) {
    console.error(error);
    throw new Error(`Error retrieving all stations: ${error.message}`);
  }
};

export const startChargingAllStations = async () => {
  try {
    const stations = await getAllStations();

    const query = `INSERT INTO ChargingState (station_id, charging) VALUES ($1, $2) ON CONFLICT (station_id) DO UPDATE SET charging = $2;`;

    const updateActivityForAllStationQuery = `
      INSERT INTO chargingactivity (station_id, company_id, company_parent_id, starttimestamp, ischarging, chargingpower) 
      VALUES ($1, $2, COALESCE((SELECT parent_id FROM company WHERE id = $2), NULL), $3, $4, $5) 
      ON CONFLICT (station_id) DO UPDATE SET 
        company_id = EXCLUDED.company_id,
        company_parent_id = EXCLUDED.company_parent_id,
        starttimestamp = EXCLUDED.starttimestamp,
        ischarging = EXCLUDED.ischarging,
        chargingpower = EXCLUDED.chargingpower
      RETURNING *;
`;

    const promises01 = stations.map((station) => {
      return pool.query(query, [station.id, true]);
    });

    const promises02 = stations.map((station) => {
      {
        return pool.query(updateActivityForAllStationQuery, [
          station.id,
          station.company_id,
          new Date(),
          true,
          10,
        ]);
      }
    });

    await Promise.all(promises01);
    await Promise.all(promises02);

    return stations;
  } catch (error) {
    console.error(error);
  }
};

export const startChargingStationById = async (stationId) => {
  try {
    // Get the station and its associations
    const station = await getStationAndAssociationsByStationId(stationId);

    // Create the query and values to update the ChargingState table
    const chargingStateQuery = {
      text: `INSERT INTO ChargingState (station_id, charging) VALUES ($1, $2) ON CONFLICT (station_id) DO UPDATE SET charging = $2;`,
      values: [station.id, true],
    };

    const chargingActivityQuery = {
      text: `INSERT INTO chargingactivity (station_id, company_id, company_parent_id, starttimestamp, chargingpower, ischarging)
      VALUES ($1, $2, COALESCE((SELECT parent_id FROM company WHERE id = $2), NULL), $3, $4, $5) 
      ON CONFLICT (station_id)
      DO UPDATE SET 
        company_id = excluded.company_id, 
        company_parent_id = excluded.company_parent_id, 
        starttimestamp = excluded.starttimestamp, 
        chargingpower = excluded.chargingpower, 
        ischarging = excluded.ischarging
      RETURNING *;`,
      values: [station.id, station.company_id, new Date(), 10, true],
    };

    await pool.query(chargingActivityQuery);
    await pool.query(chargingStateQuery);

    return station;
  } catch (error) {
    console.error(error);
    throw new Error(`Error starting charging for stationId: ${stationId}`);
  }
};

export const stopChargingAllStations = async () => {
  try {
    const chargingStateQuery = `UPDATE ChargingState SET charging = FALSE;`;

    const chargingActivityQuery = {
      text: `UPDATE chargingactivity SET isCharging = $1, endtimestamp = $2 WHERE isCharging = $3;`,
      values: [false, new Date(), true],
    };

    await pool.query(chargingStateQuery);
    await pool.query(chargingActivityQuery);
  } catch (error) {
    console.error(error);
    throw new Error("Error stopping charging for all stations");
  }
};

export const stopChargingStationById = async (stationId) => {
  try {
    // Get the station and its associations
    const station = await getStationAndAssociationsByStationId(stationId);

    // Update the ChargingActivity table by id
    const chargingActivityQuery = {
      text: `UPDATE chargingactivity SET isCharging = $1, endtimestamp = $2 WHERE station_id = $3 AND isCharging = $4;`,
      values: [false, new Date(), stationId, true],
    };

    // Update the ChargingState table by id
    const chargingStateQuery = {
      text: `UPDATE ChargingState SET charging = $1 WHERE station_id = $2;`,
      values: [false, stationId],
    };

    await pool.query(chargingActivityQuery);
    await pool.query(chargingStateQuery);

    return station;
  } catch (error) {
    console.error(error);
    throw new Error("Error stopping charging for station by ID");
  }
};
