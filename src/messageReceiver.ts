/**
 * Message Receiver Module
 * 
 * Handles incoming WhatsApp messages via webhook, orchestrates the processing
 * pipeline, and ensures server resilience through error isolation.
 */

import { Request, Response } from 'express';
import { analyzeContent } from './contentAnalyzer';
import { formatPeriodicReport } from './telegramFormatter';
import { sendToTelegram, TelegramConfig } from './telegramSender';

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text: {
            body: string;
          };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export function handleIncomingMessage(telegramConfig: TelegramConfig) {
  return async (
    req: Request<{}, {}, WhatsAppWebhookPayload>,
    res: Response
  ): Promise<void> => {
    console.log('[DEBUG] handleIncomingMessage called');
    
    // Extract messages array from the webhook payload
    console.log('[DEBUG] Extracting messages from payload...');
    const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    console.log('[DEBUG] Messages found:', messages ? messages.length : 0);
    
    // Handle case where messages array is missing or empty
    if (!messages || messages.length === 0) {
      console.log('[INFO] Webhook notification received without messages (likely a status update)');
      res.status(200).send('OK');
      return;
    }
    
    // Extract sender phone number and message text
    const from = messages[0].from;
    const messageText = messages[0].text.body;
    
    console.log('[DEBUG] Message from:', from);
    console.log('[DEBUG] Message text:', messageText);
    console.log('[DEBUG] Starting processing...');
    
    try {
      // Process message synchronously to avoid timeout
      await processMessage(from, messageText, telegramConfig);
      
      console.log('[DEBUG] Processing completed, sending 200 OK');
      res.status(200).send('OK');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ERROR] Processing failed: ${errorMessage}`);
      
      // Still respond with 200 OK to prevent WhatsApp retries
      res.status(200).send('OK');
    }
  };
}

async function processMessage(
  from: string,
  messageText: string,
  telegramConfig: TelegramConfig
): Promise<void> {
  console.log('[DEBUG] processMessage started');
  
  console.log('[DEBUG] Step 1: Analyzing content...');
  const structuredInfo = analyzeContent(messageText);
  console.log('[DEBUG] Content analyzed:', JSON.stringify(structuredInfo, null, 2));
  
  console.log('[DEBUG] Step 2: Formatting report...');
  const formattedReport = formatPeriodicReport(structuredInfo);
  console.log('[DEBUG] Report formatted. Length:', formattedReport.length);
  
  console.log('[DEBUG] Step 3: Sending to Telegram...');
  await sendToTelegram(formattedReport, telegramConfig);
  
  console.log(`[INFO] ${new Date().toISOString()} - Message from ${from} processed successfully`);
}
