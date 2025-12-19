import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenGenerator.js";

export const createUser = TryCatch(async (req, res, next) => {
  const { name, phone, email, role_id, is_team_member } = req.body;

  if (!name || !phone || !role_id) {
    throw new ApiError(400, "Name, phone, and role are required.");
  }

  const pool = await connect();
  const checkPhone = await pool.request()
    .input("phone", mssql.VarChar, phone)
    .query(`SELECT * FROM Users WHERE phone = @phone`);

  if (checkPhone.recordset.length > 0) {
    throw new ApiError(409, "Phone already registered.");
  }

  const password = phone.slice(-4); 

  const result = await pool.request()
    .input("name", mssql.VarChar, name)
    .input("phone", mssql.VarChar, phone)
    .input("email", mssql.VarChar, email)
    .input("password", mssql.VarChar, password)
    .input("role_id", mssql.Int, role_id)
    .input("is_team_member", mssql.Bit, is_team_member ? 1 : 0)
    .query(`
      INSERT INTO Users (name, phone, email, password, role_id, is_team_member)
      VALUES (@name, @phone, @email, @password, @role_id, @is_team_member);

      SELECT SCOPE_IDENTITY() AS user_id;
    `);

  res.status(201).json({
    message: "User created successfully.",
    user_id: result.recordset[0].user_id,
  });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const pool = await connect();
  const result = await pool.request()
    .query("SELECT * FROM Users");

  res.json(result.recordset);
});

export const getUserById = TryCatch(async (req, res) => {
  const { id } = req.params;  
  const pool = await connect();
  const result = await pool.request()
    .input("id", mssql.Int, id)
    .query("SELECT * FROM Users WHERE user_id = @id");
  const user = result.recordset[0];

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(user);
});

export const deleteUser = TryCatch(async (req, res) => {
  const { id } = req.params;
  const pool = await connect();
  const result = await pool.request()
    .input("id", mssql.Int, id)
    .query("DELETE FROM Users WHERE user_id = @id");
  if (result.rowsAffected[0] === 0) {
    throw new ApiError(404, "User not found");
  }
  res.json({ message: "User deleted successfully." });
});

export const updateUser = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, role_id, is_team_member } = req.body;
  const pool = await connect();

  const existingUserResult = await pool.request()
    .input("id", mssql.Int, id)
    .query("SELECT * FROM Users WHERE user_id = @id");
  const existingUser = existingUserResult.recordset[0];
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }
  await pool.request()
    .input("id", mssql.Int, id)
    .input("name", mssql.VarChar, name)
    .input("phone", mssql.VarChar, phone)
    .input("email", mssql.VarChar, email)
    .input("role_id", mssql.Int, role_id)
    .input("is_team_member", mssql.Bit, is_team_member ? 1 : 0)
    .query(`
      UPDATE Users
      SET name = @name, phone = @phone, email = @email, role_id = @role_id, is_team_member = @is_team_member
      WHERE user_id = @id;
    `);

  res.json({ message: "User updated successfully." });
});

export const login = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const pool = await connect();
  const userResult = await pool.request()
    .input("email", mssql.VarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");

  const user = userResult.recordset[0];
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = validator.equals(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refreshToken in DB (optional but recommended)
  await pool.request()
    .input("token", mssql.VarChar, refreshToken)
    .input("id", mssql.Int, user.user_id)
    .query("UPDATE Users SET refresh_token = @token WHERE user_id = @id");

  // Send cookie
  res.cookie("rtk", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    accessToken,
    user: {
      id: user.user_id,
      name: user.name,
      role: user.role,
    },
  });
});

export const refresh = TryCatch(async (req, res) => {
  const token = req.cookies.rtk;
  if (!token) throw new ApiError(401, "No session");

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;

  const pool = await connect();
  const userResult = await pool.request()
    .input("id", mssql.Int, decoded.id)
    .query("SELECT * FROM Users WHERE user_id = @id");

  const user = userResult.recordset[0];
  if (!user) throw new ApiError(401, "Invalid session");

  const newAccessToken = generateAccessToken(user);
  res.json({ accessToken: newAccessToken });
});
