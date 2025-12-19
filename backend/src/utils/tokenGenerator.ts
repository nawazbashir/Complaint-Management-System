import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateAccessToken = (user : any) => {
  return jwt.sign(
    { id: user.user_id, role: user.role_id, is_team_member: user.is_team_member, name: user.name },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.user_id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
};
