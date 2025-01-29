import Redis from "ioredis";
import logger from "../middleware/logger";

// Initialize Redis client
export const redisClient = new Redis({
     host: "127.0.0.1",
     port: 6380, // Redis port
});

// Event listeners
redisClient.on("connect", () => {
     logger.info("Connected to Redis.");
});

redisClient.on("error", (err: any) => {
     logger.error("Redis connection error:", err);
});

// Add a token to the blacklist
export const addToBlacklist = async (token: string, expiresIn: number): Promise<void> => {
     await redisClient.set(`blacklist:${token}`, "true", "EX", expiresIn);
};

// Check if a token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
     const result = await redisClient.get(`blacklist:${token}`);
     return result === "true";
};

export default redisClient;
