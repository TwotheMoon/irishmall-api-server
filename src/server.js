
import express from "express";
import cors from "cors";
import { logger } from "./middlewares/middleware";
import { healthCkController, rootController } from "./controllers/baseControllers";
import { createTokenController } from "./controllers/tokenControllers";
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);
app.get('/', rootController)
app.get('/health', healthCkController);
app.post('/getToken', createTokenController);

export default app;
