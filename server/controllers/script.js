// Import database connection pool

import {
  calculateChargingStateData,
  startChargingAllStations,
  startChargingStationById,
  stopChargingAllStations,
  stopChargingStationById,
} from "../utils/helper/script.js";

// Constants
const START_COMMAND = "Start station";
const STOP_COMMAND = "Stop station";
const ALL_STATIONS = "all";
const WAIT_COMMAND = "Wait";

// @route   POST /script-parser
const script = async (req, res) => {
  try {
    const { script: inputScript } = req.body;

    const isValidScript =
      inputScript.trim().startsWith("Begin") &&
      inputScript.trim().endsWith("End");

    if (!isValidScript) {
      return res.status(400).json({
        success: false,
        message: "Invalid script",
      });
    }

    const commands = inputScript.split("\n").filter(Boolean);

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
          await startChargingAllStations();

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;
          chargingPower = chargingStateData.totalChargingPower;
        } else {
          await startChargingStationById(stationId);

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;

          chargingPower = chargingStateData.totalChargingPower;
        }
      } else if (command.startsWith(STOP_COMMAND)) {
        const stationId = command.split(" ")[2];
        timestampData[i] = new Date().getTime();

        if (stationId === ALL_STATIONS) {
          await stopChargingAllStations();
          companiesData = [];
          chargingStations = [];
          chargingPower = 0;
        } else {
          const station = await stopChargingStationById(stationId);

          const chargingStateData = await calculateChargingStateData();

          companiesData = chargingStateData.companies;
          chargingStations = chargingStateData.totalChargingStations;
          chargingPower = chargingStateData.totalChargingPower;
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
