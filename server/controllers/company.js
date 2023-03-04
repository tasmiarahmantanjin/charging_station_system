// Import database connection pool
import pool from "../config/database.js";

// @route   POST /companies
// @desc    Get all companies
const getCompanies = async (req, res) => {
  try {
    // Get limit from client input, default to 100
    const limit = parseInt(req.query.limit) || 100;

    const query = {
      text: "SELECT * FROM company LIMIT $1",
      values: [limit],
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving companies from database.");
  }
};

// @route   POST /companies
// @desc    Create new company
const createCompany = async (req, res) => {
  const { name } = req.body;

  try {
    const query = {
      text: "INSERT INTO company (name) VALUES ($1) RETURNING *",
      values: [name],
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error while trying to create company",
    });
  }
};

// @route   GET /companies/:id
// @desc    Get company by ID
const getCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "SELECT * FROM company WHERE id=$1",
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Company with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error while retrieving company with ID ${id} from database: ${err.message}`,
    });
  }
};

// @route   PUT /companies/:id
// @desc    Update company by ID
const updateCompany = async (req, res) => {
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
      text: "UPDATE company SET name=$1 WHERE id=$2 RETURNING *",
      values: [name, id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Company with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Sever error while trying to update company with ID ${id} in database: ${err.message}`,
    });
  }
};

// @route   GET /companies/:id
// @desc    Delete company by ID
const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "DELETE FROM company WHERE id=$1 RETURNING *",
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res
        .status(200)
        .json({ success: true, message: `Company with ID ${id} deleted.` });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Company with ID ${id} not found.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error while trying to delete company with ID ${id} from database: ${err.message}`,
    });
  }
};

export default {
  getCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
};
