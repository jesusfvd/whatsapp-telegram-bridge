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

// Export for Vercel Serverless Functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`[INFO] ${new Date().toISOString()} - Server listening on port ${port}`);
    console.log(`[INFO] ${new Date().toISOString()} - Webhook endpoints ready:`);
    console.log(`[INFO] ${new Date().toISOString()} -   GET  /webhook - Verification`);
    console.log(`[INFO] ${new Date().toISOString()} -   POST /webhook - Messages`);
  });
}
