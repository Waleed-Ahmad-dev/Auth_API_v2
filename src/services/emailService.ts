import nodemailer from "nodemailer";
import { EmailPassword, EmailUser } from "../config";

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {

const transporter = nodemailer.createTransport({
     host: "smtp.gmail.com", 
     port: 587,             
     secure: false,         
     auth: {
          user: EmailUser, 
          pass: EmailPassword, 
     },
});

const mailOptions = {
     from: EmailUser,    
     to,                              
     subject,                        
     text,                         
};

     await transporter.sendMail(mailOptions);
};