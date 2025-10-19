import express from "express";
import { verifyAndDonate } from "../controllers/donation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const donationRouter = express.Router();

donationRouter.post("/donate", authMiddleware, verifyAndDonate);


export default donationRouter;
