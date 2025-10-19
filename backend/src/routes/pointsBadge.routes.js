import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { pointsBadgesController } from "../controllers/pointsbadges.controller.js";
import { badgeRules } from "../services/pointsBadgeRules.js";


const pointsBadgeRouter = express.Router();

pointsBadgeRouter.post("/earn-points", authMiddleware,pointsBadgesController.earnPoints );
pointsBadgeRouter.get("/my-points", authMiddleware,pointsBadgesController.getMyPoints);
pointsBadgeRouter.get("/allbadges", (req, res) => {
  res.json({ success: true, badges: badgeRules });
});
export default pointsBadgeRouter;
