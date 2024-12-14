import morgan from "morgan";
import multer from "multer";
import { WhiteList } from "../models/WhiteList";
import path from 'path';

// 로그
export const logger = morgan("dev");

// 업로드
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/navercate'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const uploadMycateMulter = multer({ storage });

// ip whitelist
export const whitelist = async (req, callback) => {
  const origin = req.header('Origin');
  console.log("요청: ", origin);
  if(!origin) return callback(null, { origin: false });

  try {
    const isAllowed = await WhiteList.exists({ domain: origin });
    console.log('db', isAllowed)
    if(isAllowed) {
      callback(null, { origin: origin, credentials: true,
       });
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  } catch (error) {
    callback(error);
  }
}