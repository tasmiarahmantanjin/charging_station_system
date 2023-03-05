// Import database connection pool
import pool from "../config/database.js";

// Helper Function to update the user data
const updateAccount = async (id, data) => {
  const keys = Object.keys(data);

  const info = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const values = keys.map((key) => data[key]);

  console.log("⚠️⚠️⚠️⚠️⚠️⚠️⚠️ values", values);
  console.log("⚠️⚠️⚠️⚠️⚠️⚠️⚠️ values", keys.length);

  const res = await pool.query(
    `UPDATE StationType
		SET ${info}
		WHERE id = $${keys?.length + 1}`,
    [...values, id]
  );

  return res;
};

// @route   POST /stationTypes
// @desc    Get all Station Types
const getStationTypes = async (req, res) => {
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

// @route   POST /stationTypes
// @desc    Create new Station Type
const createStationType = async (req, res) => {
  const { name, maxpower } = req.body;

  try {
    const query = {
      text: "INSERT INTO StationType (name, maxpower) VALUES ($1, $2) RETURNING *",
      values: [name, maxpower],
    };

    const result = await pool.query(query);

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error while trying to create StationType",
    });
  }
};

// @route   GET /stationTypes/:id
// @desc    Get StationType by ID
const getStationType = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "SELECT * FROM StationType WHERE id=$1",
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({
        success: false,
        message: `StationType with ID ${id} not found.`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Server error while retrieving StationType with ID ${id} from database: ${err.message}`,
    });
  }
};

// @route   PUT /stationTypes/:id
// @desc    Update Station Type by ID
const updateStationType = async (req, res) => {
  try {
    const {
      body: { name, maxpower },
      params: { id },
    } = req;

    console.log("✅✅✅✅✅", req.body);
    console.log("✅✅✅✅✅ id", id);

    // Check if name or maxpower is present in the request body
    if (!name && !maxpower) {
      return res.status(400).json({
        success: false,
        message: "Name or maxpower is required",
      });
    }

    const result = await updateAccount(id, {
      name,
    });

    // const setClause = [];
    // const values = [];

    // if (name) {
    //   setClause.push("name=$1");
    //   values.push(name);
    // } else if (maxpower) {
    //   setClause.push("maxpower=$1");
    //   values.push(maxpower);
    // } else if (name && maxpower) {
    //   setClause.push("name=$1, maxpower=$2");
    //   values.push(name, maxpower);
    // }

    // // Combine setClause into comma separated string
    // const setClauseStr = setClause.join(",");

    // const query = {
    //   text: `UPDATE StationType SET ${setClauseStr} WHERE id=$${
    //     values.length + 1
    //   } RETURNING *`,
    //   values: [...values, id],
    // };

    // const query = {
    //   text: "UPDATE StationType SET name=$1, maxpower=$2 WHERE id=$3 RETURNING *",
    //   values: [name, maxpower, id],
    // };
    // const query = {
    //   text: "UPDATE StationType SET ${setClauseStr} WHERE id=$3 RETURNING *",
    //   values: [name, maxpower, id],
    // };

    // const result = await pool.query(query);

    if (result.rowCount > 0) {
      console.log("⛔️⛔️⛔️⛔️⛔️ ~ result", result.rows);
      res.status(200).json({ success: true, message: "Update successfully" });
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

// @route   GET /stationTypes/:id
// @desc    Delete Station Type by ID
const deleteStationType = async (req, res) => {
  const { id } = req.params;

  try {
    const query = {
      text: "DELETE FROM StationType WHERE id=$1 RETURNING *",
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
  getStationTypes,
  createStationType,
  getStationType,
  updateStationType,
  deleteStationType,
};
