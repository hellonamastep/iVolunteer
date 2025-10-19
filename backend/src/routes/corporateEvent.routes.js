import express from "express";
import multer from "multer";
import { adminEventController } from "../controllers/adminEvent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const corporateEventRouter = express.Router();
const upload = multer({ dest: "uploads/events" });

corporateEventRouter.post("/create",authMiddleware ,authorizeRole("admin"), upload.single("image"), adminEventController.createEvent);
corporateEventRouter.get("/allevents", adminEventController.getEvents);
corporateEventRouter.get("/bids/:id",authMiddleware ,authorizeRole("admin"), adminEventController.getBids);
corporateEventRouter.post("/select-bid",authMiddleware ,authorizeRole("admin"), adminEventController.selectBid);
corporateEventRouter.get("/:id", adminEventController.getEventById);
corporateEventRouter.delete("/delete/:id",authMiddleware ,authorizeRole("admin"), adminEventController.deleteEvent);



export default corporateEventRouter;
