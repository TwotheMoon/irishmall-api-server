import mongoose from "mongoose";

const username = encodeURIComponent('dlaguddh1');
const password = encodeURIComponent('Rjqnrdl94');
const host = 'mongoDB';
const testHost = '192.168.50.103';
const port = '27017';
const database = 'MoonDB';
const testDbBase = "MoonDB_test";

// Main DB
const dbConnectUrl = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

// Test DB
// const dbConnectUrl = `mongodb://${username}:${password}@${testHost}:${port}/${testDbBase}?authSource=admin`; 

mongoose.connect(dbConnectUrl);

const db = mongoose.connection;

const handleError = (error) => console.log("DB error ❌", error);
const handleOpen = () => console.log("Connected to DB ✅");

db.on("error", handleError);
db.once("open", handleOpen);