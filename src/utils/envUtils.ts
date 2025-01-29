import { createError } from "./errorUtils";

export const validateEnv = (key: string): string => {
     const value = process.env[key];
     if (!value) {
          throw createError(`Missing ${key} environment variable`, 400);
     }
     return value;
};
