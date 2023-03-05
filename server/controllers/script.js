// Import database connection pool
import pool from "../config/database.js";

// Helper Function to update the user data

// @route   POST /stationTypes
// @desc    Get all Station Types
const scripts = async (req, res) => {
  try {
    const query = {
      text: "SELECT * FROM StationType",
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error while trying to get StationTypes",
    });
  }
};

export default {
  scripts,
};
