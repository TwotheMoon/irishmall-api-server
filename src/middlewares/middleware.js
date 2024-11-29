import morgan from "morgan";
import multer from "multer";

// 로그
export const logger = morgan("dev");

// 업로드
export const uploadMycateMulter = multer({ dest: "uploads/mycate"});
