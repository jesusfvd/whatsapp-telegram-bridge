/**
 * WhatsApp-Telegram Bridge Server
 * For local development only
 */

import express, { Request, Response } from 'express';
import { loadConfig } from './config';
import { handleWebhookVerification, VerificationRequest } from './webhookValidator';
import { handleIncomingMessage } from './messageReceiver';

// Load configuration
const config = loadConfig();

// Initialize Express application
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp-Telegram Bridge is running',
    timestamp: new Date().toISOString()
  });
});

// Webhook verification endpoint (GET)
app.get('/webhook', (req: Request<{}, {}, {}, VerificationRequest>, res: Response) => {
  handleWebhookVerification(req, res, config.whatsappVerifyToken);
});

// Message reception endpoint (POST)
app.post('/webhook', handleIncomingMessage({
  botToken: config.telegramBotToken,
  chatId: config.telegramChatId
}));

// Start server (for local development)
const port = config.port || 3000;
app.listen(port, () => {
  console.log(`[INFO] ${new Date().toISOString()} - Server listening on port ${port}`);
  console.log(`[INFO] ${new Date().toISOString()} - Webhook endpoints ready:`);
  console.log(`[INFO] ${new Date().toISOString()} -   GET  /webhook - Verification`);
  console.log(`[INFO] ${new Date().toISOString()} -   POST /webhook - Messages`);
});

export default app;
