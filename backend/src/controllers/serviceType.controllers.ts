import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";
export const createServiceType = TryCatch(async (req, res) => {
  let { issue_id, service_name } = req.body;

  if (!issue_id || !service_name) {
    throw new ApiError(400, "issue_id and service_name required.");
  }
  service_name = service_name.trim().toUpperCase();

  const pool = await connect();
  const issue = await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .query(`SELECT * FROM Issues WHERE issue_id = @issue_id`);
  if (issue.recordset.length === 0) {
    throw new ApiError(404, "Issue not found.");
  }

  const existingServiceType = await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .input("service_name", mssql.VarChar, service_name)
    .query(
      `SELECT * FROM ServiceTypes WHERE issue_id = @issue_id AND service_name = @service_name`
    );
  if (existingServiceType.recordset.length > 0) {
    throw new ApiError(409, "Service type already exists for this issue.");
  }
  await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .input("service_name", mssql.VarChar, service_name).query(`
      INSERT INTO ServiceTypes(issue_id, service_name)
      VALUES (@issue_id, @service_name)
    `);

  res.status(201).json({ message: "Service type created." });
});

export const getServiceTypes = TryCatch(async (req, res) => {
  const pool = await connect();
  const result = await pool.request().query(`
    SELECT s.*, i.issue_type
    FROM ServiceTypes s
    JOIN Issues i ON s.issue_id = i.issue_id
  `);
  res.json(result.recordset);
});

export const getServiceType = TryCatch(async (req, res) => {
  const { id } = req.params;
  const pool = await connect();
  const serviceType = await pool.request().input("id", mssql.Int, id).query(`
    SELECT s.*, i.issue_type 
    FROM ServiceTypes s
    JOIN Issues i ON s.issue_id = i.issue_id
    WHERE s.service_id = @id
  `);
  if (serviceType.recordset.length === 0) {
    throw new ApiError(404, "Service type not found.");
  }
  res.json(serviceType.recordset[0]);
});

export const deleteServiceType = TryCatch(async (req, res) => {
  const { id } = req.params;
  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`DELETE FROM ServiceTypes WHERE service_id = @id`);
  if (result.rowsAffected[0] === 0) {
    throw new ApiError(404, "Service type not found.");
  }
  res.json({ message: "Service type deleted successfully." });
});

export const updateServiceType = TryCatch(async (req, res) => {
  const { id } = req.params;
  let { issue_id, service_name } = req.body;
  if (!issue_id || !service_name) {
    throw new ApiError(400, "issue_id and service_name required.");
  }
  service_name = service_name.trim().toUpperCase();

  const pool = await connect();
  const issue = await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .query(`SELECT * FROM Issues WHERE issue_id = @issue_id`);
  if (issue.recordset.length === 0) {
    throw new ApiError(404, "Issue not found.");
  }
  const existingServiceType = await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .input("service_name", mssql.VarChar, service_name)
    .input("id", mssql.Int, id)
    .query(
      `SELECT * FROM ServiceTypes WHERE issue_id = @issue_id AND service_name = @service_name AND service_id != @id`
    );
  if (existingServiceType.recordset.length > 0) {
    throw new ApiError(409, "Service type already exists for this issue.");
  }
  const result = await pool
    .request()
    .input("issue_id", mssql.Int, issue_id)
    .input("service_name", mssql.VarChar, service_name)
    .input("id", mssql.Int, id)
    .query(
      `UPDATE ServiceTypes SET issue_id = @issue_id, service_name = @service_name, updated_at = SYSDATETIME() WHERE service_id = @id`
    );
  if (result.rowsAffected[0] === 0) {
    throw new ApiError(404, "Service type not found.");
  }
  res.json({ message: "Service type updated successfully." });
});
