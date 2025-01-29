// src/middleware/logger.ts – Updated logger
import morgan from "morgan";
import { logger, createMorganStream } from "../utils/loggerUtils";

export const morganMiddleware = morgan("combined", { stream: createMorganStream() });
export default logger;
