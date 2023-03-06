// Import database connection pool

import {
  calculateChargingStateData,
  startChargingAllStations,
  startChargingStationById,
  stopChargingAllStations,
  stopChargingStationById,
} from "../utils/helper/script.js";

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
const WAIT_COMMAND = "Wait";

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
    let timestampData = {};

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();

      if (command.startsWith(START_COMMAND)) {
        const stationId = command.split(" ")[2];
        timestampData[i] = new Date().getTime();

        if (stationId === ALL_STATIONS) {
          const stations = await startChargingAllStations();

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;
          chargingPower = chargingStateData.totalChargingPower;
        } else {
          const station = await startChargingStationById(stationId);

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;

          // TODO: Investigate why this is not working properly and fix it
          chargingPower = chargingStateData.totalChargingPower;
          // chargingPower += station.type[0].maxpower;
        }
      } else if (command.startsWith(STOP_COMMAND)) {
        const stationId = command.split(" ")[2];
        timestampData[i] = new Date().getTime();

        if (stationId === ALL_STATIONS) {
          await stopChargingAllStations();
          chargingStations = [];
          chargingPower = 0;
        } else {
          const station = await stopChargingStationById(stationId);

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;

          // TODO: Investigate why this is not working properly and fix it
          chargingPower = chargingStateData.totalChargingPower;
          // chargingPower -= station.type[0].maxpower;
        }
      } else if (command.startsWith(WAIT_COMMAND)) {
        const waitingTimeInSec = command.split(" ")[1];

        // Pause the script for the waitingTimeInSec
        await new Promise((resolve) =>
          setTimeout(resolve, waitingTimeInSec * 1000)
        );

        continue;
      }

      if (command === "Begin" || command === "End") {
        const stepData = {
          step: command,
          timestamp:
            command === "Begin"
              ? new Date().getTime()
              : new Date(
                  Object.values(timestampData)[
                    Object.values(timestampData).length - 1
                  ]
                ).getTime(),
          companies: [],
          totalChargingStations: [],
          totalChargingPower: 0,
        };

        chargingStateData.push(stepData);
        continue;
      }

      // const currentTime = new Date().getTime();

      let timestampBasedOnStep;
      if (i === 1) {
        timestampBasedOnStep = timestampData[i];
      } else {
        timestampBasedOnStep =
          timestampData[i - 2] + (timestampData[i] - timestampData[i - 2]);
      }

      const stepData = {
        step: command,
        timestamp: timestampBasedOnStep,
        companies: companiesData,
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
