// Import database connection pool
import pool from "../config/database.js";

// @route   POST /companies
// @desc    Get all companies
// GET /companies/:id/childStations
const getChildStations = async (req, res) => {
  const companyId = req.params.id;

  // retrieve all child companies of the given company id
  const getChildCompanies = async (companyId) => {
    const childCompanies = await db.query(
      "SELECT id FROM companies WHERE parent_company_id = $1",
      [companyId]
    );
    const childCompanyIds = childCompanies.rows.map((company) => company.id);
    const grandChildCompanyIds = await Promise.all(
      childCompanyIds.map((childCompanyId) => getChildCompanies(childCompanyId))
    );
    return [...childCompanyIds, ...grandChildCompanyIds.flat()];
  };

  const childCompanyIds = await getChildCompanies(companyId);

  // retrieve all stations that belong to the given company and its child companies
  const stations = await db.query(
    `
    SELECT stations.id, stations.name, station_types.max_power 
    FROM stations 
    INNER JOIN station_types ON stations.station_type_id = station_types.id 
    WHERE stations.company_id = $1 OR stations.company_id = ANY($2)`,
    [companyId, childCompanyIds]
  );

  res.send(stations.rows);
};

export default {
  getChildStations,
};
