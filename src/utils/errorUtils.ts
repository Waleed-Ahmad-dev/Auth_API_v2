import { NextFunction, Request, Response } from "express";
import { logger } from "./loggerUtils";

export class CustomError extends Error {
     statusCode: number;
     constructor(message: string, statusCode: number) {
          super(message);
          this.statusCode = statusCode;
          Object.setPrototypeOf(this, CustomError.prototype);
     }
}

export const errorHandler = (
     err: Error,
     req: Request,
     res: Response,
     next: NextFunction
     ): void => {
     logger.error("Error:", err);

     if (err instanceof CustomError) {
          res.status(err.statusCode).json({ error: err.message });
     } else {
          res.status(500).json({ error: "Internal Server Error" });
     }
};

export const createError = (message: string, statusCode: number): CustomError => {
     return new CustomError(message, statusCode);
};