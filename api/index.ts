import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response } from 'express';
import { loadConfig } from '../src/config';
import { handleWebhookVerification, VerificationRequest } from '../src/webhookValidator';
import { handleIncomingMessage } from '../src/messageReceiver';

// Load configuration
console.log('[DEBUG] Loading configuration...');
const config = loadConfig();
console.log('[DEBUG] Configuration loaded successfully');
console.log('[DEBUG] Bot Token:', config.telegramBotToken ? '✓ SET' : '✗ MISSING');
console.log('[DEBUG] Chat ID:', config.telegramChatId ? '✓ SET' : '✗ MISSING');

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
  console.log('[DEBUG] GET /webhook - Verification request received');
  handleWebhookVerification(req, res, config.whatsappVerifyToken);
});

// Message reception endpoint (POST)
app.post('/webhook', (req: Request, res: Response) => {
  console.log('[DEBUG] POST /webhook - Message received');
  console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const handler = handleIncomingMessage({
    botToken: config.telegramBotToken,
    chatId: config.telegramChatId
  });
  
  handler(req, res);
});

// Export for Vercel Serverless
export default app;
