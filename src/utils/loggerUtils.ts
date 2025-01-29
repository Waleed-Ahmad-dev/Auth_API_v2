import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

export const logger = createLogger({
     level: "info",
     format: combine(
          colorize(),
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          printf(({ level, message, timestamp, stack }) => {
               return `${timestamp} [${level}]: ${stack || message}`;
          })
     ),
     transports: [
          new transports.Console(),
          new transports.File({ filename: "logs/error.log", level: "error" }),
          new transports.File({ filename: "logs/combined.log" }),
     ],
});

// Utility for HTTP request logging
export const createMorganStream = () => ({
     write: (message: string) => logger.http(message.trim()),
});