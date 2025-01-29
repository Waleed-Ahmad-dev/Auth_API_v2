import dotenv from "dotenv";
import { validateEnv } from "../utils/envUtils";

dotenv.config();

export const Db = validateEnv("DATABASE_URL");
export const Port = validateEnv("PORT") || 3001;
export const JWTToken = validateEnv("JWT_TOKEN");
export const SessionToken = validateEnv("SESSION_SECRET");
export const EmailUser = validateEnv("EMAIL_USER");
export const EmailPassword = validateEnv("EMAIL_PASS");
export const GoogleClientId = validateEnv("GOOGLE_CLIENT_ID");
export const GoogleClientSecret = validateEnv("GOOGLE_CLIENT_SECRET");
export const GithubClientId = validateEnv("GITHUB_CLIENT_ID");
export const GithubClientSecret = validateEnv("GITHUB_CLIENT_SECRET");
export const LinkedinClientId = validateEnv("LINKEDIN_CLIENT_ID");
export const LinkedinClientSecret = validateEnv("LINKEDIN_CLIENT_SECRET");
export const RefreshTokenSecret = validateEnv("REFRESH_TOKEN_SECRET");
export const ClientUrl = validateEnv("CLIENT_URL");
