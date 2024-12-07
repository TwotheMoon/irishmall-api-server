import "./db";
import "./models/NaverAllCate";
import "./models/MyCate";
import "./models/WhiteList";
import app from "./server"
import fs from "fs";
import https from "https";

const PORT = 433;

const options = {
  key: fs.readFileSync('./keys/private.pem'),
  cert: fs.readFileSync('./keys/public.pem'),
}

const handleListening = () => {
  console.log(`Server is running on https://localhost:${PORT}`);
};

https.createServer(options, app).listen(PORT, handleListening);
