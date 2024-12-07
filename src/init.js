import "./db";
import "./models/NaverAllCate";
import "./models/MyCate";
import "./models/WhiteList";
import app from "./server"

const fs = require('fs');
const https = require('https');
const path = require('path');

const __filename = __filename || path.resolve(process.cwd(), __filename);
const __dirname = path.dirname(__filename);

const PORT = 433;

const options = {
  key: fs.readFileSync(path.join(__dirname, './keys/private.pem')),
  cert: fs.readFileSync(path.join(__dirname, './keys/public.pem')),
}

const handleListening = () => {
  console.log(`Server is running on https://localhost:${PORT}`);
};

https.createServer(options, app).listen(PORT, handleListening);
