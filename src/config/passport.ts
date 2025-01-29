import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../prisma/client";
import { ClientUrl, GithubClientId, GithubClientSecret, GoogleClientId, GoogleClientSecret } from ".";
import axios from 'axios'
import { logger } from "../utils/loggerUtils";
import { sendEmail } from "../services/emailService";
import { confirmationToken } from "../auth/AuthController";

interface GitHubEmail {
     email: string;
     primary: boolean;
     verified: boolean;
}

passport.use(
     new GoogleStrategy(
          {
               clientID: GoogleClientId,
               clientSecret: GoogleClientSecret,
               callbackURL: "/auth/google/callback",
          },
          async (accessToken: string, 
               refreshToken: string, 
               profile: Profile, 
               done: (error: any, user?: any) => void
     ) => {
               try {

                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                         return done(new Error("No email associated with this Google account"));
                    }

                    const user = await prisma.user.upsert({
                         where: { email },
                         update: {
                              name: profile.displayName,
                              providerId: profile.id,
                              provider: "google",
                         },
                         create: {
                              email,
                              name: profile.displayName,
                              providerId: profile.id,
                              provider: "google",
                              password: "", // Password not needed for OAuth users
                              isConfirmed: true, // New users must confirm their email
                              confirmationToken,
                              confirmationExpires: new Date(Date.now() + 3600000),
                         },
               });
               if (!user.isConfirmed) {
                    const confirmationUrl = `${ClientUrl}/auth/confirm-email?token=${user.confirmationToken}`;
                    await sendEmail(
                         user.email,
                         "Account Confirmation",
                         `Click the link to confirm your account: ${confirmationUrl}`
                    );
               }
               done(null, user);
               } catch (err) {
                    done(err,);
               }
          }
     )
);

passport.use(
     new GitHubStrategy(
          {
               clientID: GithubClientId,
               clientSecret: GithubClientSecret,
               callbackURL: "/auth/github/callback",
          },
          async (
               accessToken: string, 
               refreshToken: string, 
               profile: Profile, 
               done: (error: any, user?: any) => void
          ) => {
               try {
                    logger.info("Access token", accessToken)

                    if (!accessToken) {
                         logger.error("No Access Token");
                         return done(new Error("Failed to obtain access token from GitHub"), null);
                    }
                    let email = profile.emails?.[0]?.value;

                    if (!email) {
                              const response = await axios.get<GitHubEmail[]>(
                                   "https://api.github.com/user/emails", 
                                   {
                                   headers: { Authorization: `Bearer ${accessToken}` },
                                   }
                              );

                              const primaryEmail = response.data.find(
                                   (email: { primary: boolean; verified: boolean }) => email.primary && email.verified
                              );

                              email = primaryEmail?.email;

                              if (!email) {
                                   return done(new Error("No email associated with this GitHub account"), null);
                              }
                         }

                    const name = profile.displayName || profile.username
                    if(!name) {
                         return done(new Error("No name associated with this GitHub account"), null);
                    }

                    const user = await prisma.user.upsert({
                         where: { email },
                         update: {
                              name: profile.displayName || profile.username,
                              providerId: profile.id,
                              provider: "github",
                         },
                         create: {
                              email,
                              name,
                              providerId: profile.id,
                              provider: "github",
                              password: "", // Password not needed for OAuth users
                              isConfirmed: true, // New users must confirm their email
                              confirmationToken,
                              confirmationExpires: new Date(Date.now() + 3600000), // 1 hour from now
                         },
                    });

                    if (!user.isConfirmed) {
                         const confirmationUrl = `${ClientUrl}/auth/confirm-email?token=${user.confirmationToken}`;
                         await sendEmail(
                              user.email,
                              "Account Confirmation",
                              `Click the link to confirm your account: ${confirmationUrl}`
                         );
                    }
                    done(null, user);
               } catch (err) {
                    done(err, null);
               }
          }
     )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
     const user = await prisma.user.findUnique({ where: { id } });
     done(null, user);
});
