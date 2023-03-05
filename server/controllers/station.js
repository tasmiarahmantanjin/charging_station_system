// Import database connection pool
import pool from "../config/database.js";

// @route   POST /companies
// @desc    Get all companies
const getStations = async (req, res) => {
  try {
    // Get limit from client input, default to 100
    const limit = parseInt(req.query.limit) || 100;

    const query = {
      text: "SELECT * FROM Station LIMIT $1",
      values: [limit],
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error while trying to get Stations",
    });
  }
};

// @route   POST /companies
// @desc    Create new Station
const createStation = async (req, res) => {
  const { name, company_id, type_id } = req.body;

  try {
    const query = {
      text: "INSERT INTO Station (name, company_id, type_id) VALUES ($1, $2, $3) RETURNING *",
      values: [name, company_id, type_id],
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error while trying to create Station",
    });
  }
};

// @route   GET /companies/:id
// @desc    Get Station by ID
const getStation = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "SELECT * FROM Station WHERE id=$1",
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Station with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error while retrieving Station with ID ${id} from database: ${err.message}`,
    });
  }
};

// @route   PUT /companies/:id
// @desc    Update Station by ID
const updateStation = async (req, res) => {
  try {
    const {
      body: { name },
      params: { id },
    } = req;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const query = {
      text: "UPDATE Station SET name=$1 WHERE id=$2 RETURNING *",
      values: [name, id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Station with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Sever error while trying to update Station with ID ${id} in database: ${err.message}`,
    });
  }
};

// @route   GET /companies/:id
// @desc    Delete Station by ID
const deleteStation = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "DELETE FROM Station WHERE id=$1 RETURNING *",
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res
        .status(200)
        .json({ success: true, message: `Station with ID ${id} deleted.` });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Station with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error while trying to delete Station with ID ${id} from database: ${err.message}`,
    });
  }
};

export default {
  getStations,
  createStation,
  getStation,
  updateStation,
  deleteStation,
};
