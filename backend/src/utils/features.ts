import mssql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!, 
  port: Number(process.env.DB_PORT!), 
  options: {
    trustServerCertificate: true,
    trustedConnection: true,
    enableArithAbort: true,
  },
};
 
export const connect = () => mssql.connect(config);
export { mssql};