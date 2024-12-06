import express from "express";
import cors from "cors";
import { logger, uploadMycateMulter, whitelist } from "./middlewares/middleware";
import { getNasLogController, healthCkController, rootController } from "./controllers/baseControllers";
import { getAllMyCateController, getPopularCateController, updateMyCateExcelController, updateNaverAllCateController } from "./controllers/cateControllers";
import { createWhiteListController, deleteWhiteListController, readWhiteListController, updateWhiteListController } from "./controllers/whiteListControllers";
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors(whitelist));
app.use(logger);


app.get('/', rootController)
app.get('/health', healthCkController)
app.get('/getNasLog', getNasLogController)
app.get('/getAllMyCate', getAllMyCateController)

// 카테고리 관련 EP
app.post('/updateNaverAllCate', updateNaverAllCateController)
app.post('/getPopularCate', getPopularCateController)
app.post('/uploadMyCateExcel', uploadMycateMulter.single("file"), updateMyCateExcelController)


// 개발자설정 관련 EP
app.post('/createWitelist', createWhiteListController);
app.post('/readeWitelist', readWhiteListController);
app.post('/updateWitelist', updateWhiteListController);
app.post('/deleteWitelist', deleteWhiteListController);

export default app;