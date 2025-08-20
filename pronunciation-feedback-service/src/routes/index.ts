import express from "express";
import pronunciationRouter from "./pronunciationFeedback.routes";

const rootRouter = express.Router();

rootRouter.use("/pronunciations", pronunciationRouter);

export default rootRouter;
