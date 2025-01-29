import { check } from "express-validator";

export const validateUserSignUp = [
     check("email").isEmail().trim().normalizeEmail().escape(),
     check("password")
          .isLength({ min: 8 })
          .matches(/[A-Z]/).matches(/[a-z]/).matches(/\d/).matches(/[!@#$%^&*]/)
          .escape(), // Prevents XSS
     check("name").trim().isLength({ min: 2 }).escape(),
];

export const validateUserLogin = [
     check("email").isEmail().withMessage("Invalid email format"),
     check("password").notEmpty().withMessage("Password is required"),
];
