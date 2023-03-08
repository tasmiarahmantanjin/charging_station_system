// Import database connection pool
import pool from "../config/database.js";

// @route   POST /child-companies
const getCompanyAndAssociations = async (req, res) => {
  try {
    const { id: companyId } = req.params;

    // retrieve all child companies of the given company id
    const getChildCompanies = async (companyId) => {
      const childCompanies = await pool.query(
        "SELECT id FROM company WHERE parent_id = $1",
        [companyId]
      );

      const childCompanyIds = childCompanies.rows.map((company) => company.id);
      const grandChildCompanyIds = await Promise.all(
        childCompanyIds.map((childCompanyId) =>
          getChildCompanies(childCompanyId)
        )
      );
      return [...childCompanyIds, ...grandChildCompanyIds.flat()];
    };

    const childCompanyIds = await getChildCompanies(companyId);

    // retrieve all stations that belong to the given company and its child companies
    const stations = await pool.query(
      `
      SELECT station.id, station.name, stationtype.maxpower 
      FROM station 
      INNER JOIN stationtype ON station.type_id = stationtype.id 
      WHERE station.company_id = $1 OR station.company_id = ANY($2)`,
      [companyId, childCompanyIds]
    );

    const data = stations.rows;

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export default {
  getCompanyAndAssociations,
};
