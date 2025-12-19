import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";
// CREATE ISSUE
export const createIssue = TryCatch(async (req, res, next) => {
  let { issue_type } = req.body;

  if (!issue_type || issue_type.trim() === "")
    throw new ApiError(400, "issue_type is required and must be valid");

  issue_type = issue_type.trim().toUpperCase();

  const pool = await connect();
  const existingIssue = await pool
    .request()
    .input("issue_type", mssql.VarChar, issue_type)
    .query(`SELECT * FROM Issues WHERE issue_type = @issue_type`);
  if (existingIssue.recordset.length > 0)
    throw new ApiError(409, "Issue type already exists");
  await pool
    .request()
    .input("issue_type", mssql.VarChar, issue_type)
    .query(`INSERT INTO Issues (issue_type) VALUES (@issue_type)`);

  res.json({ message: "Issue created successfully" });
});

// GET SINGLE ISSUE
export const getIssue = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`SELECT * FROM Issues WHERE issue_id = @id`);

  if (result.recordset.length === 0) throw new ApiError(404, "Issue not found");

  res.json(result.recordset[0]);
});

// GET ALL ISSUES
export const getIssues = TryCatch(async (req, res, next) => {
  const pool = await connect();
  const result = await pool.request().query(`SELECT * FROM Issues`);
  res.json(result.recordset);
});

// DELETE ISSUE
export const deleteIssue = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`DELETE FROM Issues WHERE issue_id = @id`);

  if (result.rowsAffected[0] === 0) throw new ApiError(404, "Issue not found");

  res.json({ message: "Issue deleted successfully" });
});

// UPDATE ISSUE
export const updateIssue = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  let { issue_type } = req.body;

  if (!issue_type || issue_type.trim() === "")
    throw new ApiError(400, "issue_type is required and must be valid");

  issue_type = issue_type.trim().toUpperCase();

  const pool = await connect();
  const existingIssue = await pool
    .request()
    .input("issue_type", mssql.VarChar, issue_type)
    .input("id", mssql.Int, id)
    .query(
      `SELECT * FROM Issues WHERE issue_type = @issue_type AND issue_id != @id`
    );

  if (existingIssue.recordset.length > 0)
    throw new ApiError(409, "Another issue with the same type already exists");

  const result = await pool 
    .request()
    .input("id", mssql.Int, id)
    .input("issue_type", mssql.VarChar, issue_type)
    .query(
      `UPDATE Issues SET issue_type = @issue_type, updated_at=SYSDATETIME() WHERE issue_id = @id`
    );

  if (result.rowsAffected[0] === 0) throw new ApiError(404, "Issue not found");

  res.json({ message: "Issue updated successfully" });
});
