import "./db";
import "./models/NaverAllCate";
import "./models/MyCate";
import "./models/WhiteList";
import app from "./server"

import fs from "fs";
import https from "https";
import path from "path";

const PORT = 433;

const options = {
  key: fs.readFileSync(path.join(__dirname, './keys/private.pem')),
  cert: fs.readFileSync(path.join(__dirname, './keys/public.pem')),
}

const handleListening = () => {
  console.log(`Server is running on https://localhost:${PORT}`);
};

https.createServer(options, app).listen(PORT, handleListening);
