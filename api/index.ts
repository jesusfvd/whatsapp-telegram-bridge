import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response } from 'express';
import { loadConfig } from '../src/config';
import { handleWebhookVerification, VerificationRequest } from '../src/webhookValidator';
import { handleIncomingMessage } from '../src/messageReceiver';

// Load configuration
const config = loadConfig();

// Initialize Express app
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

// Export for Vercel Serverless
export default app;
