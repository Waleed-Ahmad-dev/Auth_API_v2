import { WebSocketServer, WebSocket } from "ws";
import prisma from "../prisma/client";

interface Client {
     id: string; // User ID or session ID
     socket: WebSocket;
}

class WebSocketService {
     private static instance: WebSocketService;
     private wss: WebSocketServer;
     private clients: Map<string, WebSocket>;

     private constructor() {
          this.clients = new Map();
          this.wss = new WebSocketServer({ noServer: true });

          this.wss.on("connection", (socket: WebSocket, request) => {
               const userId = request.url?.split("=")[1]; // Extract user ID from query string
               if (userId) {
                    this.clients.set(userId, socket);
                    console.log(`Client connected: ${userId}`);
               }

               socket.on("close", () => {
                    if (userId) {
                         this.clients.delete(userId);
                         console.log(`Client disconnected: ${userId}`);
                    }
               });
          });
     }

     public static getInstance(): WebSocketService {
          if (!WebSocketService.instance) {
               WebSocketService.instance = new WebSocketService();
          }
          return WebSocketService.instance;
     }

     // Send a message to a specific user
     public async sendToUser(userId: number, type: string, data: any) {
          const clientSocket = this.clients.get(userId.toString());
          const message = data.message || "Notification received"; // Ensure a default message is provided
          if (clientSocket) {
               clientSocket.send(JSON.stringify({ type, data }));
          } else {
               await prisma.notification.create({
                    data: {
                         userId,
                         type,
                         message,
                         data,
                    },
               });
          }
     }

     // Broadcast a message to all connected users
     public broadcast(event: string, data: any) {
          this.clients.forEach((socket) => {
               if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ event, data }));
               }
          });
     }

     public getServer() {
          return this.wss;
     }

}

export const websocketService = WebSocketService.getInstance();
