// Import database connection pool
import pool from "../config/database.js";

// const exampleScript = `
// Begin
// Start station 1
// Wait 5
// Start station 2
// Wait 10
// Start station all
// Wait 10
// Stop station 2
// Wait 10
// Stop station 3
// Wait 5
// Stop station all
// End
// `;

const exampleScript = `
Begin
Start station 2
Wait 10
End
`;

const exampleResponseData = [
  {
    step: "Begin",
    timestamp: "1678028342822",
    companies: [],
    totalChargingStations: [],
    totalChargingPower: 0,
  },
  {
    step: "Start station 1",
    timestamp: "1678028342822",
    companies: [
      {
        id: 1,
        chargingStations: [1],
        chargingPower: 10,
      },
      {
        id: 3,
        chargingStations: [1],
        chargingPower: 10,
      },
    ],
    totalChargingStations: [1],
    totalChargingPower: 10,
  },
  {
    step: "Start station 2",
    // timestamp: <unix-timestamp-of-step-3 = timestamp-of-step-2 + 5seconds>,
    timestamp: "1678018275527",
    companies: [
      {
        id: 1,
        chargingStations: [1, 2],
        chargingPower: 20,
      },
      {
        id: 2,
        chargingStations: [2],
        chargingPower: 10,
      },
      {
        id: 3,
        chargingStations: [1],
        chargingPower: 10,
      },
    ],
    totalChargingStations: [1, 2],
    totalChargingPower: 20,
  },
  {
    step: "Start station all",
    // timestamp: <unix-timestamp-of-step-4 = timestamp-of-step-3 + 10seconds>,
    timestamp: "1678018275527",
    companies: [
      {
        id: 1,
        chargingStations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        chargingPower: 100,
      },
      {
        id: 2,
        chargingStations: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        chargingPower: 90,
      },
      {
        id: 3,
        chargingStations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        chargingPower: 100,
      },
    ],
    totalChargingStations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    totalChargingPower: 100,
  },
  // Continue ...
];

// Constants
const START_COMMAND = "Start station";
const STOP_COMMAND = "Stop station";
const ALL_STATIONS = "all";
const WAIT_COMMAND = "Wait";

// Helper functions
const getStationsAndItsCompany = async () => {
  const query = `
    SELECT
    s.id,
    s.name,
    s.company_id,
    s.type_id,
    st.name AS station_type,
    st.maxpower AS maxpower,
    cs.charging AS isCharging,
    json_agg(
        json_build_object(
            'id', c.id,
            'name', c.name,
            'parentCompanyId', c.parent_id
        )
    ) AS company
  FROM station s
  LEFT JOIN company c ON s.company_id = c.id
  LEFT JOIN stationType st ON s.type_id = st.id
  LEFT JOIN chargingstate cs ON s.id = cs.station_id
  GROUP BY s.id, s.name, s.company_id, s.type_id, st.name, st.maxpower, cs.charging
  ORDER BY s.id;`;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
// TODO: Change the name --- getStationAndAssociationsByStationId
const getStationById = async (stationId) => {
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
  }
};

const groupStationsByCompany = (stations) => {
  const companies = [];

  stations.forEach((station) => {
    const { id, name, parentCompanyId } = station.company[0];
    const company = companies.find((company) => company.id === id);

    if (company) {
      company.stations.push(station);
    } else {
      companies.push({
        id,
        name,
        parentCompanyId,
        stations: [station],
      });
    }
  });

  return companies;
};

// Helper function to calculate charging state data
const calculateChargingStateData = async (stationId = ALL_STATIONS) => {
  // Get all stations from database
  // const stations = await getStationsAndItsCompany();
  let stations;

  if (stationId === ALL_STATIONS) {
    // Get all stations from database
    stations = await getStationsAndItsCompany();
  } else {
    // Get specific station from database
    const station = await getStationById(stationId);
    if (!station) {
      throw new Error(`Station with id ${stationId} not found`);
    }
    stations = [station];
  }

  // Group stations by company
  const stationsByCompany = groupStationsByCompany(stations);

  // Calculate charging state for each company
  // const companiesChargingState = stationsByCompany.map((company) => {
  //   const { id, stations, parentCompanyId } = company;

  //   const chargingStations = stations.filter((station) => station.ischarging);

  //   const chargingPower = chargingStations.reduce((totalPower, station) => {
  //     return totalPower + station.maxpower;
  //   }, 0);

  //   // if parentCompanyId is present then attach the same data
  //   let parentCompanyChargingState = {};
  //   if (parentCompanyId) {
  //     // TODO: make it dynamic, now it works only for one station
  //     parentCompanyChargingState.id = stations[0].id;
  //     parentCompanyChargingState.chargingStations = chargingStations.map(
  //       (station) => station.id
  //     );
  //     parentCompanyChargingState.chargingPower = chargingPower;
  //   }
  //   console.log("parentCompany", parentCompanyChargingState);

  //   // Calculate total power for each company

  //   return {
  //     id,
  //     chargingStations: chargingStations.map((station) => station.id),
  //     chargingPower,
  //     parentCompanyChargingState,
  //   };
  // });

  const companiesChargingState = stationsByCompany.flatMap((company) => {
    const { id, stations, parentCompanyId } = company;

    const chargingStations = stations.filter((station) => station.ischarging);

    const chargingPower = chargingStations.reduce(
      (totalPower, station) => totalPower + station.maxpower,
      0
    );

    let companyData = {
      id,
      chargingStations: chargingStations.map((station) => station.id),
      chargingPower,
    };

    if (parentCompanyId) {
      let parentCompanyData = {
        id: parentCompanyId,
        chargingStations: chargingStations.map((station) => station.id),
        chargingPower,
      };

      return [companyData, parentCompanyData];
    } else {
      return [companyData];
    }
  });

  const allStationsChargingState = stations.reduce(
    (state, station) => {
      if (station.ischarging) {
        state.chargingStations.push(station.id);
        state.chargingPower += station.maxpower;
      }

      return state;
    },
    { chargingStations: [], chargingPower: 0 }
  );

  // Return the charging state data
  return {
    companiesChargingState: companiesChargingState.sort((a, b) =>
      a.id > b.id ? 1 : -1
    ),
    allStationsChargingState,
  };
};

const getAllStations = async () => {
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
  }
};

const startChargingAllStations = async () => {
  const stations = await getAllStations();

  const query = `INSERT INTO ChargingState (station_id, charging) VALUES ($1, $2) ON CONFLICT (station_id) DO UPDATE SET charging = $2;`;
  const updateActivityForAllStationQuery = `
  INSERT INTO chargingactivity (station_id, company_id, company_parent_id, starttimestamp, ischarging, chargingpower)
  SELECT $1, $2, COALESCE(c.parent_id, null), $3, $4, $5
  FROM company c
  WHERE c.id = $2;
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
};

const startChargingStationById = async (stationId) => {
  const station = await getStationById(stationId);

  const query = `INSERT INTO ChargingState (station_id, charging) VALUES ($1, $2) ON CONFLICT (station_id) DO UPDATE SET charging = $2;`;
  const queryValues = [station.id, true];

  const createQuery = `INSERT INTO chargingactivity (station_id, company_id, company_parent_id, starttimestamp, chargingpower, ischarging)
  VALUES ($1, $2, COALESCE((SELECT parent_id FROM company WHERE id = $2), NULL), $3, $4, $5) RETURNING *;`;

  const createQueryValues = [
    station.id,
    station.company_id,
    new Date(),
    10,
    true,
  ];

  await pool.query(createQuery, createQueryValues);
  await pool.query(query, queryValues);

  return station;
};

const stopChargingAllStations = async () => {
  const query = `UPDATE ChargingState SET charging = FALSE;`;
  await pool.query(query);

  const updateQuery =
    "UPDATE chargingactivity SET isCharging = $1, endtimestamp = $2 WHERE isCharging = $3";
  const values = [false, new Date(), true];

  await pool.query(updateQuery, values);
};

const stopChargingStationById = async (stationId) => {
  const station = await getStationById(stationId);

  const query = `UPDATE chargingactivity SET isCharging = $1, endtimestamp = $2 WHERE station_id = $3 AND isCharging = $4;`;
  const values = [false, new Date(), stationId, true];

  // Also, update the ChargingState table by id
  const updateQuery = `UPDATE ChargingState SET charging = $1 WHERE station_id = $2;`;
  const updateValues = [false, stationId];

  await pool.query(query, values);
  await pool.query(updateQuery, updateValues);

  return station;
};

// @route   POST /script-parser
const script = async (req, res) => {
  try {
    // const script = req.body.script;

    const isValidScript =
      exampleScript.trim().startsWith("Begin") &&
      exampleScript.trim().endsWith("End");

    if (!isValidScript) {
      return res.status(400).json({
        success: false,
        message: "Invalid script",
      });
    }

    const commands = exampleScript.split("\n").filter(Boolean);

    const chargingStateData = [];
    let chargingStations = [];
    let chargingPower = 0;
    let companiesData = [];

    let tasmia;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();

      if (command.startsWith(START_COMMAND)) {
        const stationId = command.split(" ")[2];

        if (stationId === ALL_STATIONS) {
          const stations = await startChargingAllStations();

          chargingStations = stations.map((station) => station.id);
          chargingPower = stations.reduce((totalPower, station) => {
            return totalPower + station.type[0].maxpower;
          }, 0);
        } else {
          const station = await startChargingStationById(stationId);

          // From chargingactivity get all the company carging status based on stationId

          const query = `SELECT json_build_object(
                'step', 'Start station 1',
                'timestamp', '1678028342822',
                'companies', (
                    SELECT json_agg(company_data)
                    FROM (
                        SELECT c.id,
                            ARRAY(SELECT DISTINCT station_id FROM chargingactivity WHERE company_id = c.id) AS chargingStations,
                            SUM(ca.chargingpower) AS chargingPower
                        FROM chargingactivity ca
                        INNER JOIN company c ON ca.company_id = c.id
                        WHERE ca.station_id = 1
                        GROUP BY c.id
                    ) company_data
                ),
                'totalChargingStations', ARRAY(SELECT DISTINCT station_id FROM chargingactivity WHERE station_id = 1),
                'totalChargingPower', (
                    SELECT SUM(chargingpower)
                    FROM chargingactivity
                    WHERE station_id = 1
                )
            );`;

          const tas = await pool.query(query);
          tasmia = tas.rows;

          const chargingStateData = await calculateChargingStateData(stationId);

          const companiesChargingStateData =
            chargingStateData.companiesChargingState;

          // Push companiesChargingStateData to companyData array
          // companiesData.push(companiesChargingStateData);

          // Check on every iteration if there is something inside companiesChargingStateData already
          // If the value exists already, replace it or add it as a second object
          if (companiesData.length > 0) {
            const companyIndex = companiesData.findIndex(
              (company) => company.id === companiesChargingStateData.id
            );
            if (companyIndex > -1) {
              companiesData[companyIndex] = companiesChargingStateData;
            } else {
              companiesData.push(companiesChargingStateData);
            }
          } else {
            companiesData.push(companiesChargingStateData);
          }

          if (!chargingStations.includes(parseInt(stationId))) {
            chargingStations.push(parseInt(stationId));
          }
          chargingPower += station.type[0].maxpower;
        }
      } else if (command.startsWith(STOP_COMMAND)) {
        const stationId = command.split(" ")[2];

        // Stop charging all stations
        if (stationId === ALL_STATIONS) {
          // TODO: Update charging state data to get correct output
          // from calculateChargingStateData function
          await stopChargingAllStations();
          chargingStations = [];
          chargingPower = 0;

          // Update charging state data
        } else {
          const station = await stopChargingStationById(stationId);

          chargingStations = chargingStations.filter(
            (id) => id !== parseInt(stationId)
          );

          chargingPower -= station.type[0].maxpower;
        }
      } else if (command.startsWith(WAIT_COMMAND)) {
        // Wait step is ignored, continue with the next step
        continue;
      }

      if (command === "Begin" || command === "End") {
        const stepData = {
          step: command,
          timestamp: new Date().getTime(),
          companies: [],
          totalChargingStations: [],
          totalChargingPower: 0,
        };

        chargingStateData.push(stepData);
        continue;
      }

      // const newData = await calculateChargingStateData();

      const stepData = {
        step: command,
        timestamp: new Date().getTime(),
        companies: companiesData,
        // companies: await calculateChargingStateData("all"),
        totalChargingStations: chargingStations,
        // totalChargingStations:
        //   newData.allStationsChargingState.chargingStations,
        totalChargingPower: chargingPower,
      };

      chargingStateData.push(stepData);
    }

    res.json({ data: chargingStateData, tasmia });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export default {
  script,
};
