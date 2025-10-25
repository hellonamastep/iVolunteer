import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import notificationController from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

// Get all notifications for authenticated user
notificationRouter.get("/", authMiddleware, notificationController.getNotifications);

// Get unread count
notificationRouter.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

// Mark notifications as read
notificationRouter.put("/mark-read", authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
notificationRouter.put("/mark-all-read", authMiddleware, notificationController.markAllAsRead);

// Delete a notification
notificationRouter.delete("/:id", authMiddleware, notificationController.deleteNotification);

// Delete all read notifications
notificationRouter.delete("/read/all", authMiddleware, notificationController.deleteAllRead);

export default notificationRouter;
