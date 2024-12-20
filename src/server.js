import express from "express";
import cors from "cors";
import { logger, uploadMycateMulter, whitelist } from "./middlewares/middleware";
import { getNasLogController, healthCkController, rootController } from "./controllers/baseControllers";
import { getAllMyCateController, updateMyCateExcelController } from "./controllers/cateControllers";
import { createWhiteListController, deleteWhiteListController, readWhiteListController, updateWhiteListController } from "./controllers/whiteListControllers";
import { getPopularCateController, updateNaverAllCateController, updateNaverCateAttrController, uploadNaverCateExcelController } from "./controllers/naverCateControllers";
import path from 'path';
import { testController } from "./controllers/testControllers";
import { getAdKeywordController } from "./controllers/adKeywordControllers";
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors(whitelist));
app.use(logger);

// 정적 파일 서빙 설정
app.use('/uploads/navercate', express.static(path.join(__dirname, '../uploads/navercate')));

// 기본 EP
app.get('/', rootController)
app.get('/health', healthCkController)
app.get('/getNasLog', getNasLogController)

// 카테고리 관련 EP
app.get('/getAllMyCate', getAllMyCateController)
app.post('/updateNaverAllCate', updateNaverAllCateController)
app.post('/getPopularCate', getPopularCateController)
app.post('/uploadMyCateExcel', uploadMycateMulter.single("file"), updateMyCateExcelController)
app.post('/uploadNaverCateExcel', uploadMycateMulter.single("file"), uploadNaverCateExcelController)
app.post('/updateNaverCateAttr', updateNaverCateAttrController) // 최신 네이버 카테 속성 업데이트 배치

// 키워드 관련 EP
app.post('/getAdKeyword', getAdKeywordController);

// 개발자설정 관련 EP
app.post('/createWitelist', createWhiteListController);
app.post('/readeWitelist', readWhiteListController);
app.post('/updateWitelist', updateWhiteListController);
app.post('/deleteWitelist', deleteWhiteListController);

// 테스트 EP
app.post('/test', testController);

export default app;