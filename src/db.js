import mongoose from "mongoose";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT || '27017';
const database = process.env.MONGODB_DATABASE;

const dbConnectUrl = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

mongoose.connect(dbConnectUrl);

const db = mongoose.connection;

const handleError = (error) => console.log("DB error ❌", error);
const handleOpen = () => console.log("Connected to DB ✅");

db.on("error", handleError);
db.once("open", handleOpen);