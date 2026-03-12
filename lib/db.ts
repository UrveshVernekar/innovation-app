import mysql from 'mysql2/promise';
// import fs from "fs";
// import path from "path";

export const getDbConnection = async (database: string) => {
    // let ca: string;

    // if (process.env.VERCEL) {
    // ca = process.env.MYSQL_CA_CERT as string;
    // } else {
    // const caPath = path.join(process.cwd(), "certs", "ca.pem");
    // ca = fs.readFileSync(caPath, "utf-8");
    // }

    return await mysql.createConnection({
        host: process.env.NEXT_PUBLIC_DB_HOST!,
        user: process.env.NEXT_PUBLIC_DB_USER!,
        password: process.env.NEXT_PUBLIC_DB_PASSWORD!,
        database,
        port: Number(process.env.NEXT_PUBLIC_DB_PORT)!,
        ssl: {
            // ca,
            rejectUnauthorized: false,
        }
    });
};