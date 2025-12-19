import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";

// CREATE DEPARTMENT
export const createDepartment = TryCatch(async (req, res, next) => {
  let { deptt_name } = req.body;

  if (!deptt_name || deptt_name.trim() === "") {
    throw new ApiError(
      400,
      "Department name is required and must be valid"
    );
  }

  deptt_name = deptt_name.trim().toUpperCase();

  const pool = await connect();
  const existingDepartment = await pool
    .request()
    .input("deptt_name", mssql.VarChar, deptt_name)
    .query(`SELECT * FROM Departments WHERE deptt_name = @deptt_name`);

  if (existingDepartment.recordset.length > 0) {
    throw new ApiError(409, "Department name already exists");
  }

  await pool.request().input("deptt_name", mssql.VarChar, deptt_name).query(`
            INSERT INTO Departments (deptt_name)
            VALUES (@deptt_name)
        `);

  res.json({ message: "Department created successfully" });
});

// GET ALL DEPARTMENTS
export const getDepartments = TryCatch(async (req, res, next) => {
  const pool = await connect();
  const result = await pool.request().query(`SELECT * FROM Departments`);
  res.json(result.recordset);
});

// GET SINGLE DEPARTMENT
export const getDepartment = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`SELECT * FROM Departments WHERE deptt_id = @id`);

  if (result.recordset.length === 0) {
    throw new ApiError(404, "Department not found");
  }

  res.json(result.recordset[0]);
});

// DELETE DEPARTMENT
export const deleteDepartment = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`DELETE FROM Departments WHERE deptt_id = @id`);

  if (result.rowsAffected[0] === 0) {
    throw new ApiError(404, "Department not found");
  }

  res.json({ message: "Department deleted successfully" });
});

// UPDATE DEPARTMENT
export const updateDepartment = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  let { deptt_name } = req.body;

  if (!deptt_name || deptt_name.trim() === "") {
    throw new ApiError(400, "Department name is required to update");
  }

  deptt_name = deptt_name.trim().toUpperCase();

  const pool = await connect();

  const duplicateCheck = await pool.request()
    .input("deptt_name", mssql.VarChar, deptt_name)
    .input("id", mssql.Int, Number(id))
    .query(`
      SELECT 1 FROM Departments
      WHERE deptt_name = @deptt_name AND deptt_id != @id
    `);

  if (duplicateCheck.recordset.length > 0) {
    throw new ApiError(409, "Another department with the same name already exists");
  }

  const updateQuery = await pool.request()
    .input("deptt_name", mssql.VarChar(100), deptt_name)
    .input("id", mssql.Int, Number(id))
    .query(`
      UPDATE Departments
      SET deptt_name = @deptt_name, updated_at = SYSDATETIME()
      WHERE deptt_id = @id
    `);

  if (updateQuery.rowsAffected[0] === 0) {
    throw new ApiError(404, "Department not found");
  }

  res.json({ message: "Department updated successfully" });
});

