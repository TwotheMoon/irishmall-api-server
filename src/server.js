import express from "express";
import cors from "cors";
import { logger, uploadMycateMulter } from "./middlewares/middleware";
import { healthCkController, rootController } from "./controllers/baseControllers";
import { getPopularCateController, updateMyCateExcelController, updateNaverAllCateController } from "./controllers/cateControllers";
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);
app.get('/', rootController)
app.get('/health', healthCkController)
app.post('/updateNaverAllCate', updateNaverAllCateController)
app.post('/getPopularCate', getPopularCateController)
app.post('/uploadMyCateExcel', uploadMycateMulter.single("file"), updateMyCateExcelController)


export default app;
