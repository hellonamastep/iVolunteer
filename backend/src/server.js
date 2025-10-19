import {app} from "./app.js"
import { logger } from "./utils/logger.js";
import {connectDB} from "./config/db.js"
import mongoose from "mongoose";

import dotenv from "dotenv"
dotenv.config();

let httpServer;
let isShuttingDown = false;
let port = process.env.PORT || 5000;

const shutdownLogger = async() => {
    return new Promise((resolve) => {
        // Finish any buffered logs and close each transport
        for(const transport of logger.transports){
            if(typeof transport.close === "function"){
                transport.close();
            } else if(typeof transport.end === "function"){
                transport.end();
            }
        }

        resolve();
    })
}


const server = async() => {
    try {
        // First try to connect to database
        await connectDB();
        logger.info("📦 Connected to MongoDB");

        // Add error handler for app initialization
        const initializeApp = () => {
            return new Promise((resolve, reject) => {
                try {
                    httpServer = app.listen(port, () => {
                        logger.info(`🚀 Server running on PORT: ${port}`);
                        resolve();
                    });

                    httpServer.on('error', (err) => {
                        logger.error(`Failed to start server: ${err.message}`);
                        reject(err);
                    });
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });
        };

        await initializeApp();
    } catch (error) {
        logger.error(
            `Failed to start server! error message: ${error.message}, error stack: ${error.stack}`
        );
        process.exit(1);
    }


    // ---- Graceful shutdown signals ----

    process.on("uncaughtException", async(error) => {
        await handleFatalError("uncaughtException", error);
    });

    process.on("unhandledRejection", async(reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));

        await handleFatalError("unhandledRejection", error);
    });

    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.once("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

    process.on("exit", (code) => {
        // Note: exit is synchronous, no asyn work here
        if(!isShuttingDown){
            logger.info(`Process exiting with code ${code}`);
        }
    })
}

const handleFatalError = async(type, error) => {
    if(isShuttingDown) return;

    logger.error(`🚨 ${type.toUpperCase()}: ${error.message}`);

    logger.error(error.stack);
    await gracefulShutdown(type);
}

const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

const gracefulShutdown = async(signal) => {
    if(isShuttingDown) {
        logger.info("Shutdown already in progress, ignoring signal")
        return;
    }

    isShuttingDown = true;
    logger.info(`🛑 Shutting down the server (${signal})...`)

    const shutdownTimer = setTimeout(() => {
        logger.error("Force shutdown after timeout");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT)

    try {
        if(httpServer){
            await new Promise((resolve) => httpServer.close(() => resolve()));

            logger.info("🛑 HTTP server closed");
        }

        if(mongoose.connection.readyState === 1){
            await mongoose.disconnect();
            logger.info("🔌 MongoDB connection closed");
        }
        await shutdownLogger();

        clearTimeout(shutdownTimer);

        logger.info("✅ Shutdown complete");
        process.exit(0);
    } catch (error) {
        clearTimeout(shutdownTimer);
        logger.error(`Error during shutdown: ${error.message}`);
        process.exit(1);
    }

}

server().catch((error) => {
    console.error("Fatal error in server startup:", error);
    process.exit(1);
});