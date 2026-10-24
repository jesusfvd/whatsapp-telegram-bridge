/**
 * Telegram Sender Module
 * Uses native https module for better compatibility with Vercel
 */

import https from 'https';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

interface TelegramSendMessagePayload {
  chat_id: string;
  text: string;
}

export async function sendToTelegram(
  message: string,
  config: TelegramConfig
): Promise<void> {
  console.log('[DEBUG] sendToTelegram called');
  console.log('[DEBUG] Chat ID:', config.chatId);
  console.log('[DEBUG] Bot Token (first 10 chars):', config.botToken.substring(0, 10) + '...');
  console.log('[DEBUG] Message length:', message.length);
  
  const payload: TelegramSendMessagePayload = {
    chat_id: config.chatId,
    text: message
  };

  const payloadString = JSON.stringify(payload);
  console.log('[DEBUG] Payload prepared');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${config.botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    };

    console.log('[DEBUG] Making HTTPS request to Telegram...');

    const req = https.request(options, (res) => {
      console.log('[DEBUG] Response status:', res.statusCode);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('[DEBUG] Response received:', data);
        
        if (res.statusCode === 200) {
          console.log('[INFO] Message sent to Telegram successfully');
          resolve();
        } else {
          const error = `Telegram API error [${res.statusCode}]: ${data}`;
          console.error('[ERROR]', error);
          reject(new Error(error));
        }
      });
    });

    req.on('error', (error) => {
      console.error('[ERROR] Network error:', error.message);
      reject(new Error(`Network error sending to Telegram: ${error.message}`));
    });

    req.on('timeout', () => {
      console.error('[ERROR] Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(10000); // 10 second timeout

    console.log('[DEBUG] Writing payload to request...');
    req.write(payloadString);
    req.end();
    console.log('[DEBUG] Request sent');
  });
}
