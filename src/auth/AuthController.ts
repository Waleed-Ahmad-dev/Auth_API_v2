import { Request, Response } from "express";
import prisma from "../prisma/client";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ClientUrl, JWTToken, RefreshTokenSecret }  from "../config";
import crypto from "crypto";
import { sendEmail } from "../services/emailService";
import { addToBlacklist, redisClient } from "../services/tokenBlacklistService";
import { createError } from "../utils/errorUtils";
import { logger } from "../utils/loggerUtils";

export const confirmationToken = crypto.randomBytes(32).toString("hex");



export const signUp = async (req: Request, res: Response): Promise<void> => {
     try {
          const { email, password, name } = req.body;
          
          const existingUser = await prisma.user.findUnique({
               where: { email },
               select: {id: true},
          })

          if (existingUser) {
               throw createError("User already exists", 400);
          }

          const hashedPassword = await argon2.hash(password);


          const user = await prisma.user.create({
               data: { 
                    email, 
                    password: hashedPassword, 
                    name, 
                    confirmationToken,
                    confirmationExpires: new Date(Date.now() + 3600000), // 1 hour from now
                    providerId: "local", // Default value for standard users
                    provider: "local",   // Default value for standard users
               },
          });


          const confirmationUrl = `${ClientUrl}/auth/confirm-email?token=${confirmationToken}`;

               await sendEmail(
                    email,
                    "Account Confirmation",
                    `Click the link to confirm your account: ${confirmationUrl}`
               );

          res.status(201).json({
               message: "User registered successfully",
               user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
               },
          });
          return;
     } catch (err) {
          logger.error("Error during sign-up:", err);
          res.status(500).json({ message: "Internal server error" });
          return;
     }
};

export const confirmEmail = async (req: Request, res: Response): Promise<void> => {
     try {
          const { token } = req.query;
     
          const user = await prisma.user.findFirst({
               where: {
                    confirmationToken: token as string,
                    confirmationExpires: {
                         gte: new Date(), // Ensure the token hasn't expired
                    },
               },
          });
     
          if (!user) {
               throw createError("Cannot Find The User", 400);
          }
     
          await prisma.user.update({
               where: { id: user.id },
               data: {
                    isConfirmed: true,
                    confirmationToken: null,
                    confirmationExpires: null,
               },
          });
     
          res.status(200).json({ message: "Account confirmed successfully!" });
     } catch (err) {
          logger.error("Error during email confirmation:", err);
          res.status(500).json({ message: "Internal server error" });
     }
};

export const login = async (req: Request, res: Response): Promise<void> => {
     try {
          const { email, password } = req.body;

          const user = await prisma.user.findUnique({
               where: { email },
          });

          if (!user) {
               throw createError("Cannot Find the User", 400);
          }

          if (!user.isConfirmed) {
               throw createError("Please confirm your email before logging in", 403);
          }

          const isPasswordValid = await argon2.verify(user.password, password);

          if (!isPasswordValid) {
               throw createError("Invalid email or password", 401);
          }

          const token = jwt.sign({ id: user.id }, JWTToken, { expiresIn: '1h' });
          const refreshToken = jwt.sign({ id: user.id }, RefreshTokenSecret, { expiresIn: '7d' });

          await redisClient.set(user.id.toString(), refreshToken);

          res.status(200).json({
               message: "Login successful",
               token,
               user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
               },
          });
     } catch (err) {
          res.status(500).json({ message: "Internal server error" });
          logger.info(err);
     }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
     try {
          const { token } = req.body;

          if (!token) {
               throw createError("Refresh token is required", 400);
          }

          // Verify and decode the refresh token
          const decoded = jwt.verify(token, RefreshTokenSecret) as jwt.JwtPayload;

          // Find the token in the database
          const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
          if (!storedToken || storedToken.userId !== decoded.id) {
               throw createError("Invalid refresh token", 403);
          }

          // Rotate the refresh token
          const newRefreshToken = jwt.sign({ id: decoded.id }, RefreshTokenSecret, { expiresIn: "7d" });
          await prisma.refreshToken.create({
               data: {
                    token: newRefreshToken,
                    userId: decoded.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
               },
          });

          // Delete the old refresh token
          await prisma.refreshToken.delete({ where: { token } });

          // Issue a new access token
          const newAccessToken = jwt.sign({ id: decoded.id }, JWTToken, { expiresIn: "15m" });

          res.status(200).json({
               accessToken: newAccessToken,
               refreshToken: newRefreshToken,
          });
     } catch (err) {
          logger.error("Refresh token error:", err);
          res.status(500).json({ message: "Internal server error" });
     }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
     try {
          const { email } = req.body;

          const user = await prisma.user.findUnique({
               where: { email },
          });
          if (!user) {
               throw createError("User not Found", 404);
          }
          // Generate a reset token
          const resetToken = crypto.randomBytes(32).toString("hex");
          // Save token and expiration time in the database
          await prisma.user.update({
               where: { email },
               data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
               },
          });

          const resetUrl = `${ClientUrl}/reset-password?token=${resetToken}`;
          await sendEmail(user.email, "Password Reset Request", `Reset your password: ${resetUrl}`);;
          
          res.status(200).json({
               message: "Password reset email sent. Please check your inbox.",
          });
     } catch (err) {
          logger.error("Error in requestPasswordReset:", err);
          res.status(500).json({ message: "Internal server error" });
     }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
     try {
          const { token, newPassword } = req.body;

          const user = await prisma.user.findFirst({
               where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                         gte: new Date(), // Ensure token hasn't expired
                    },
               },
          });
          if (!user) {
               throw createError("User not Found", 404);
          }

          const hashedPassword = await argon2.hash(newPassword);

          await prisma.user.update({
               where: { id: user.id },
               data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
               },
          });

          res.status(200).json({ message: "Password has been reset successfully" });
     } catch (err) {
          logger.error("Error in resetPassword:", err);
          res.status(500).json({ message: "Internal server error" });
     }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
     const token = req.headers.authorization?.split(" ")[1];

     if (!token) {
          res.status(400).json({ message: "Token is required for logout" });
          return;
     }

     try {
          
          const decoded = jwt.verify(token, JWTToken) as jwt.JwtPayload;
          const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;

          await addToBlacklist(token, expiresIn);

          res.status(200).json({ message: "Logout successful" });
          } catch (err) {
               logger.error("Error during logout:", err);
               res.status(500).json({ message: "Internal server error" });
          }
};