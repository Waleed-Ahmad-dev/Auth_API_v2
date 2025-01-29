import { Application, NextFunction, Request, Response } from "express";
import { GetHomePage } from "../controllers";
import AuthRouter from "../auth/AuthRoutes";

const Router = (app: Application) => {
     app.get("/", GetHomePage);
     app.use("/auth", AuthRouter);
};

export default Router;
