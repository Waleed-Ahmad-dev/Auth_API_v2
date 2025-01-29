import express from 'express';
import { ClientUrl, GithubClientSecret, Port, SessionToken } from './config';
import Router from './routes';
import cleanUpCorn from './cron/cleanupCron';
import { errorHandler } from './utils/errorUtils';
import apiRateLimiter from './middleware/rateLimiter';
import logger, { morganMiddleware } from './middleware/logger';
import compression from 'compression';
import session from 'express-session';
import passport from 'passport';
import { createServer } from 'http';
import { websocketService } from './services/WebSocketService';
import cors from 'cors';
import helmet from 'helmet';

// Initialize app and HTTP server
const app = express();
const server = createServer(app);

// Attach WebSocket server
server.on("upgrade", (request, socket, head) => {
     websocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
          try {
               websocketService.getServer().emit("connection", ws, request);
          } catch (error) {
               console.error("WebSocket connection error:", error);
               ws.close();
          }
     });
});
app.use(helmet({
          contentSecurityPolicy: {
          directives: {
               defaultSrc: ["'self'"],
               scriptSrc: ["'self'", ClientUrl]
          }
     }
}));

app.use(cors({
     origin: ClientUrl,
     methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
}));

// Initialize cron jobs
cleanUpCorn();

// Apply middlewares
app.use(compression());
app.use(morganMiddleware);
app.set('trust proxy', '127.0.0.1');
app.use(express.json());
app.use('/api', apiRateLimiter); // Apply rate limiting to API routes

// Add express-session middleware
app.use(
     session({
          secret: SessionToken,
          resave: false,
          saveUninitialized: false,
          cookie: {
               secure: process.env.NODE_ENV === "production",
               httpOnly: true,
          },
     })
);



// Passport initialization and session
app.use(passport.initialize());
app.use(passport.session());

// Attach application routes
Router(app);

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(Port, () => {
     logger.info(`Server is running on ${ClientUrl}`);
});
