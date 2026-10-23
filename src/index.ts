/**
 * WhatsApp-Telegram Bridge Server
 * Configured for Vercel Serverless Functions
 */

import express, { Request, Response } from 'express';
import { loadConfig } from './config';
import { handleWebhookVerification, VerificationRequest } from './webhookValidator';
import { handleIncomingMessage } from './messageReceiver';

// Load configuration from environment variables
const config = loadConfig();

// Initialize Express application
const app = express();

// Configure middleware for automatic JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp-Telegram Bridge is running',
    timestamp: new Date().toISOString()
  });
});

// Register webhook verification endpoint (GET /webhook)
app.get('/webhook', (req: Request<{}, {}, {}, VerificationRequest>, res: Response) => {
  handleWebhookVerification(req, res, config.whatsappVerifyToken);
});

// Register message reception endpoint (POST /webhook)
app.post('/webhook', handleIncomingMessage({
  botToken: config.telegramBotToken,
  chatId: config.telegramChatId
}));

// Export the Express app for Vercel
export default app;
