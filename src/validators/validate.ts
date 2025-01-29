import { NextFunction, Request, Response } from "express";
import { check, ValidationChain, validationResult } from "express-validator";
import { JWTToken } from "../config";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { createError } from "../utils/errorUtils";
import { isTokenBlacklisted } from "../services/tokenBlacklistService";


export const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     const token = req.headers.authorization?.split(" ")[1];

     if (!token) {
          res.status(401).json({ message: "Unauthorized: No token provided" });
          return;
     }

     try {
          // Check if the token is blacklisted
          const isBlacklisted = await isTokenBlacklisted(token);
          if (isBlacklisted) {
               res.status(403).json({ message: "Token is revoked" });
               return;
          }

        // Verify the token
          const decoded = jwt.verify(token, JWTToken) as { id: number };

        // Fetch the user and attach it to the request
          const user = await prisma.user.findUnique({
               where: { id: decoded.id },
               select: { id: true, email: true, name: true },
          });

          if (!user) {
               throw createError("User not found", 404);
          }

          req.user = user; // Attach user info to the request
          next();
     } catch (err) {
          res.status(403).json({ message: "Invalid token" });
     }
};
