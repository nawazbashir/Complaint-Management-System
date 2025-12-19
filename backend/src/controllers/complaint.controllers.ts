import { TryCatch } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { mssql, connect } from "../utils/features.js";
import validator from "validator";
// CREATE COMPLAINT
export const createComplaint = TryCatch(async (req, res, next) => {
    let { department_id, issue_id, complaint_detail, status } = req.body;
    const user_id = req.user.id;
    console.log(department_id, issue_id, user_id, complaint_detail, status, req.user);
    if (!department_id || !issue_id || !complaint_detail || !user_id) {
        throw new ApiError(400, "department_id, issue_id and complaint_detail are required");
    }

    complaint_detail = complaint_detail.trim();
    if (complaint_detail.length === 0) {
        throw new ApiError(400, "complaint_detail cannot be empty");
    }

    if (!status) status = "Pending"; // default status

    const pool = await connect();
    await pool.request()
        .input("department_id", mssql.Int, department_id)
        .input("issue_id", mssql.Int, issue_id)
        .input("user_id", mssql.Int, user_id)
        .input("complaint_detail", mssql.NVarChar, complaint_detail)
        .input("status", mssql.VarChar, status)
        .query(`
            INSERT INTO Complaints (department_id, issue_id, user_id, complaint_detail, status)
            VALUES (@department_id, @issue_id, @user_id, @complaint_detail, @status)
        `);

    res.json({ message: "Complaint created successfully" });
});

// GET ALL COMPLAINTS
export const getComplaints = TryCatch(async (req, res, next) => {
    const pool = await connect();
    const result = await pool.request().query(`
        SELECT c.complaint_id, c.complaint_detail, c.status, c.created_at, c.updated_at,
               d.deptt_name, i.issue_type
        FROM Complaints c
        JOIN Departments d ON c.department_id = d.deptt_id
        JOIN Issues i ON c.issue_id = i.issue_id
    `);

    res.json(result.recordset);
});

export const getUserComplaints = TryCatch(async (req, res, next) => {
    const user_id = req.user.id;
    console.log(user_id)
    const pool = await connect();
    const result = await pool.request()
        .input("user_id", mssql.Int, user_id)
        .query(`
        SELECT c.complaint_id, c.complaint_detail, c.status, c.created_at, c.updated_at,
               d.deptt_name, i.issue_type, u.name AS user_name
            FROM Complaints c
            JOIN Departments d ON c.department_id = d.deptt_id
            JOIN Issues i ON c.issue_id = i.issue_id
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.user_id = @user_id
        `);
    if (result.recordset.length === 0) {
        throw new ApiError(404, "No complaints found for this user");
    }

    res.json(result.recordset);
});

// GET SINGLE COMPLAINT
export const getComplaint = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const pool = await connect();
    const result = await pool.request()
        .input("id", mssql.Int, id)
        .query(`
             c.complaint_id, c.complaint_detail, c.status, c.created_at, c.updated_at,
                   d.deptt_name, i.issue_type
            FROM Complaints c
            JOIN Departments d ON c.department_id = d.deptt_id
            JOIN Issues i ON c.issue_id = i.issue_id
            WHERE c.complaint_id = @id
        `);

    if (result.recordset.length === 0) {
        throw new ApiError(404, "Complaint not found");
    }

    res.json(result.recordset[0]);
});

// DELETE COMPLAINT
export const deleteComplaint = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const pool = await connect();
    const result = await pool.request()
        .input("id", mssql.Int, id)
        .query(`DELETE FROM Complaints WHERE complaint_id = @id`);

    if (result.rowsAffected[0] === 0) {
        throw new ApiError(404, "Complaint not found");
    }

    res.json({ message: "Complaint deleted successfully" });
});

// UPDATE COMPLAINT
export const updateComplaint = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    let { department_id, issue_id, complaint_detail, status } = req.body;

    if (
        department_id === undefined &&
        issue_id === undefined &&
        complaint_detail === undefined &&
        status === undefined
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const pool = await connect();
    const request = pool.request();
    request.input("id", mssql.Int, id);

    const setClauses: string[] = [];
    if (department_id !== undefined) {
        request.input("department_id", mssql.Int, department_id);
        setClauses.push("department_id = @department_id");
    }
    if (issue_id !== undefined) {
        request.input("issue_id", mssql.Int, issue_id);
        setClauses.push("issue_id = @issue_id");
    }
    if (complaint_detail !== undefined) {
        complaint_detail = complaint_detail.trim();
        request.input("complaint_detail", mssql.NVarChar, complaint_detail);
        setClauses.push("complaint_detail = @complaint_detail");
    }
    if (status !== undefined) {
        request.input("status", mssql.VarChar, status);
        setClauses.push("status = @status");
    }

    const query = `
        UPDATE Complaints
        SET ${setClauses.join(", ")}, updated_at = SYSDATETIME()
        WHERE complaint_id = @id
    `;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
        throw new ApiError(404, "Complaint not found");
    }

    res.json({ message: "Complaint updated successfully" });
});
