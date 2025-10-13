import express from "express";
import corporateBidController from "../controllers/corporateBid.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const corporateBidRouter = express.Router();

corporateBidRouter.get(
  "/events",
  authMiddleware,
  authorizeRole("ngo"),
  corporateBidController.getOpenEvents
);
corporateBidRouter.post(
  "/bid",
  authMiddleware,
  corporateBidController.placeBid
);

export default corporateBidRouter;
