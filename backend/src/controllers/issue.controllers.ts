import { TryCatch } from "../middlewares/error.middleware.js";
import { mssql, connect } from "../utils/features.js";
export const createIssue = TryCatch(async (req, res, next) => {
  try {
    console.log("New issue triggered.")
    const { issue_type } = req.body;

    if (!issue_type)
      return res.status(400).json({ message: "issue_type is required" });

    const pool = await connect();
    await pool.request()
      .input("issue_type", mssql.VarChar, issue_type)
      .query(`
        INSERT INTO Issues (issue_type)
        VALUES (@issue_type)
      `);

    res.json({ message: "Issue created successfully" });
  } catch (err) {
    console.error("Error creating issue:", err);
    res.status(500).json({ message: "Failed to create issue" });
  }
}); 