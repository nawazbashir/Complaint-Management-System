import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";
export const createRole = TryCatch(async (req, res) => {
  let { role_name } = req.body;

  if (!role_name || !validator.isAlpha(role_name.trim()))
    throw new ApiError(400, "Role name required and should be valid.");

  role_name = role_name.trim().toUpperCase();
  const pool = await connect();
  const existingRole = await pool
    .request()
    .input("role_name", mssql.VarChar, role_name)
    .query(`SELECT * FROM Roles WHERE role_name = @role_name`);
  if (existingRole.recordset.length > 0)
    throw new ApiError(409, "Role name already exists.");

  await pool
    .request()
    .input("role_name", mssql.VarChar, role_name)
    .query(`INSERT INTO Roles(role_name) VALUES (@role_name)`);

  res.status(201).json({ message: "Role created." });
});

export const getRoles = TryCatch(async (req, res) => {
  const pool = await connect();
  const roles = await pool.request().query(`SELECT * FROM Roles`);
  res.json(roles.recordset);
});

export const getRole = TryCatch(async (req, res) => {
  const { id } = req.params;
  const pool = await connect();
  const role = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`SELECT * FROM Roles WHERE role_id = @id`);
  if (role.recordset.length === 0) throw new ApiError(404, "Role not found.");
  res.json(role.recordset[0]);
});

export const deleteRole = TryCatch(async (req, res) => {
  const { id } = req.params;
  const pool = await connect();
  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .query(`DELETE FROM Roles WHERE role_id = @id`);
  if (result.rowsAffected[0] === 0) throw new ApiError(404, "Role not found.");
  res.json({ message: "Role deleted successfully." });
});

export const updateRole = TryCatch(async (req, res) => {
  const { id } = req.params;
  let { role_name } = req.body;
  if (!role_name || !validator.isAlpha(role_name.trim()))
    throw new ApiError(400, "Role name required and should be valid.");

  role_name = role_name.trim().toUpperCase();
  const pool = await connect();
  const existingRole = await pool
    .request()
    .input("role_name", mssql.VarChar, role_name)
    .input("id", mssql.Int, id)
    .query(
      `SELECT * FROM Roles WHERE role_name = @role_name AND role_id != @id`
    );
  if (existingRole.recordset.length > 0)
    throw new ApiError(409, "Role name already exists.");

  const result = await pool
    .request()
    .input("id", mssql.Int, id)
    .input("role_name", mssql.VarChar, role_name)
    .query(
      `UPDATE Roles SET role_name = @role_name, updated_at = SYSDATETIME() WHERE role_id = @id`
    );
  if (result.rowsAffected[0] === 0) throw new ApiError(404, "Role not found.");
  res.json({ message: "Role updated successfully." });
});
