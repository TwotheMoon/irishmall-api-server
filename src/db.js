import mongoose from "mongoose";

const username = encodeURIComponent('dlaguddh1');
const password = encodeURIComponent('Rjqnrdl94');
const host = '192.168.50.103';
const port = '27017';
const database = 'MoonDB';

const dbConnectUrl = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

mongoose.connect(dbConnectUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

const handleError = (error) => console.log("DB error ❌", error);
const handleOpen = () => console.log("Connected to DB ✅");

db.on("error", handleError);
db.once("open", handleOpen);