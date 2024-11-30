import morgan from "morgan";
import multer from "multer";
import { WhiteList } from "../models/WhiteList";

// 로그
export const logger = morgan("dev");

// 업로드
export const uploadMycateMulter = multer({ dest: "uploads/mycate"});

// ip whitelist
export const whitelist = async (req, callback) => {
  const origin = req.header('Origin');
  console.log("리퀘스트", origin);
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
    callback(err);
  }
}