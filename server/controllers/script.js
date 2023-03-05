// Import database connection pool
import pool from "../config/database.js";

const exampleScript = `
Begin
Start station 1
Wait 5
Start station 2
Wait 10
Start station all
Wait 10
Stop station 2
Wait 10
Stop station 3
Wait 5
Stop station all
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
  INNER JOIN company c ON s.company_id = c.id
  INNER JOIN stationType st ON s.type_id = st.id
  INNER JOIN chargingstate cs ON s.id = cs.station_id
  GROUP BY s.id, s.name, s.company_id, s.type_id, st.name, st.maxpower, cs.charging
  ORDER BY s.id;`;

  try {
    const result = await pool.query(query);
    return result.rows;
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
const calculateChargingStateData = async () => {
  // Get all stations from database
  const stations = await getStationsAndItsCompany();

  // Group stations by company
  const stationsByCompany = groupStationsByCompany(stations);

  // Calculate charging state for each company
  const companiesChargingState = stationsByCompany.map((company) => {
    const { id, stations } = company;

    const chargingStations = stations.filter((station) => station.ischarging);

    const chargingPower = chargingStations.reduce((totalPower, station) => {
      return totalPower + station.maxpower;
    }, 0);

    return {
      id,
      chargingStations: chargingStations.map((station) => station.id),
      chargingPower,
    };
  });

  const allStationsChargingState = stations.reduce(
    (state, station) => {
      if (station.isCharging) {
        state.chargingStations.push(station.id);
        state.chargingPower += station.maxPower;
      }

      return state;
    },
    { chargingStations: [], chargingPower: 0 }
  );

  // Return the charging state data
  return {
    companiesChargingState,
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

  return stations;
};

const getStationById = async (stationId) => {
  try {
    const station = await pool.query(
      `SELECT
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
        WHERE s.id = $1
        GROUP BY s.id, s.name, s.company_id, s.type_id
        ORDER BY s.id;`,
      [stationId]
    );

    return station.rows[0];
  } catch (error) {
    console.error(error);
  }
};

const startChargingStationById = async (stationId) => {
  const station = await getStationById(stationId);

  return station;
};

const stopChargingStationById = async (stationId) => {
  const station = await getStationById(stationId);

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

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();

      if (command.startsWith("Start station")) {
        const stationId = command.split(" ")[2];

        if (stationId === ALL_STATIONS) {
          const stations = await startChargingAllStations();

          chargingStations = stations.map((station) => station.id);
          chargingPower = stations.reduce((totalPower, station) => {
            return totalPower + station.type[0].maxpower;
          }, 0);
        } else {
          const station = await startChargingStationById(stationId);

          if (!chargingStations.includes(stationId)) {
            chargingStations.push(stationId);
          }
          chargingPower += station.type[0].maxpower;
        }
      } else if (command.startsWith("Stop station")) {
        const stationId = command.split(" ")[2];

        // Stop charging all stations
        if (stationId === ALL_STATIONS) {
          chargingStations = [];
          chargingPower = 0;
        } else {
          const station = await stopChargingStationById(stationId);

          // Remove the items from chargingStations array where value is equal to stationId
          chargingStations = chargingStations.filter((id) => id !== stationId);
          chargingPower -= station.type[0].maxpower;
        }
      } else if (command.startsWith("Wait")) {
        // Wait step is ignored, continue with the next step
        continue;
      }

      if (command === "Begin") {
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

      const stepData = {
        step: command,
        timestamp: new Date().getTime(),
        companies: await calculateChargingStateData(),
        totalChargingStations: chargingStations,
        totalChargingPower: chargingPower,
      };

      chargingStateData.push(stepData);
    }

    res.json({ data: chargingStateData });
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
