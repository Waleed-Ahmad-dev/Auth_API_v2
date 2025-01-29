import { Request, Response } from "express";

export const GetHomePage = (req: Request, res: Response) => {
     res.send('Welcome to the Home Page!');
}