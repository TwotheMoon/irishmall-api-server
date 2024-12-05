import mongoose from "mongoose";

const username = encodeURIComponent('dlaguddh1');
const password = encodeURIComponent('Rjqnrdl94');
const host = 'mongoDB';
const port = '27017';
const database = 'MoonDB';
const testDbBase = "MoonDB_test";

// 메인 DB
// const dbConnectUrl = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

// 테스트 DB
const dbConnectUrl = `mongodb://${username}:${password}@${host}:${port}/${testDbBase}?authSource=admin`; 

mongoose.connect(dbConnectUrl);

const db = mongoose.connection;

const handleError = (error) => console.log("DB error ❌", error);
const handleOpen = () => console.log("Connected to DB ✅");

db.on("error", handleError);
db.once("open", handleOpen);