import cron from 'node-cron'
import prisma from "../prisma/client";
import logger from '../middleware/logger';

// Runs every hour
const cleanUpCron = () => {
     cron.schedule("0 * * * *", async () => {
          try {
               const now = new Date();
               await prisma.user.deleteMany({
                    where: {
                         isConfirmed: false,
                         confirmationExpires: {
                              lte: now,
                         },
                    },
               });
               logger.info("Unconfirmed accounts deleted.");
          } catch (err) {
               logger.error("Error deleting unconfirmed accounts:", err);
          }
     });
};

export default cleanUpCron;