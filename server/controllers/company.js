import pool from "../config/database.js";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import crypto from "crypto";

const findUserInfoFromDB = async (key, value, ...args) => {
  const info = args.length == 0 ? "*" : args.join(", ");
  const res = await pool.query(`SELECT ${info} FROM users WHERE ${key} = $1`, [
    value,
  ]);
  return res.rows[0];
};

// @route   POST /getCompanies
// @desc    Get all companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const result = await dbClient.query("SELECT * FROM companies");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving companies from database.");
  }
};

// @route   POST /createCompany
// @desc    Create new company
// @access  Public
const createCompany = async (req, res) => {
  const { name } = req.body;

  try {
    const newCompany = await pool.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(newCompany.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route   GET /getCompany
// @desc    Get company by ID
// @access  Public
const getCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await dbClient.query("SELECT * FROM companies WHERE id=$1", [
      id,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send(`Company with ID ${id} not found.`);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(`Error retrieving company with ID ${id} from database.`);
  }
};

// @route   PUT /updateCompany
// @desc    Update company by ID
// @access  Public
const updateCompany = async (req, res) => {
  const {
    body: { name },
    params: { id },
  } = req;

  try {
    const result = await dbClient.query(
      "UPDATE companies SET name=$1 WHERE id=$2 RETURNING *",
      [name, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send(`Company with ID ${id} not found.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error updating company with ID ${id} in database.`);
  }
};

// @route   GET /deleteCompany
// @desc    Delete company by ID
// @access  Public
const deleteCompany = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbClient.query(
      "DELETE FROM companies WHERE id=$1 RETURNING *",
      [id]
    );
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
    res.status(500).send(`Error deleting company with ID ${id} from database.`);
  }
};

export default {
  getCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
};
