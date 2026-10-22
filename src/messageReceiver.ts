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

/**
 * WhatsApp Cloud API webhook payload structure
 * 
 * Requirements: 2.1, 2.3, 2.4
 */
export interface WhatsAppWebhookPayload {
  /** Always "whatsapp_business_account" for WhatsApp webhooks */
  object: string;
  
  /** Array of webhook entries */
  entry: Array<{
    /** Business account ID */
    id: string;
    
    /** Array of changes in this entry */
    changes: Array<{
      /** The changed data */
      value: {
        /** Always "whatsapp" */
        messaging_product: string;
        
        /** Metadata about the phone number */
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        
        /** Contact information (optional) */
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        
        /** Array of messages (optional - may not be present in all webhooks) */
        messages?: Array<{
          /** Sender phone number */
          from: string;
          
          /** Message ID */
          id: string;
          
          /** Timestamp */
          timestamp: string;
          
          /** Message text content */
          text: {
            body: string;
          };
          
          /** Message type */
          type: string;
        }>;
      };
      
      /** Field that changed (e.g., "messages") */
      field: string;
    }>;
  }>;
}

/**
 * Handles incoming WhatsApp messages via POST webhook
 * 
 * This function:
 * 1. Responds immediately with HTTP 200 OK (prevents WhatsApp timeout)
 * 2. Extracts message data from the webhook payload
 * 3. Processes the message asynchronously through the pipeline
 * 4. Isolates errors to prevent server crashes
 * 
 * @param telegramConfig - Telegram configuration for sending messages
 * @returns Express route handler function
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function handleIncomingMessage(telegramConfig: TelegramConfig) {
  return async (
    req: Request<{}, {}, WhatsAppWebhookPayload>,
    res: Response
  ): Promise<void> => {
    // Respond immediately with 200 OK to acknowledge receipt
    // Requirement 2.2
    res.status(200).send('OK');
    
    // Extract messages array from the webhook payload
    // Requirements: 2.3, 2.4
    const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    
    // Handle case where messages array is missing or empty
    // Requirement 2.5
    if (!messages || messages.length === 0) {
      console.log('[INFO] Webhook notification received without messages (likely a status update)');
      return;
    }
    
    // Extract sender phone number and message text
    // Requirements: 2.3, 2.4
    const from = messages[0].from;
    const messageText = messages[0].text.body;
    
    // Process message asynchronously with error isolation
    // Requirements: 2.6, 7.1, 7.2, 7.3, 7.4, 7.5
    processMessageSafely(from, messageText, telegramConfig);
  };
}

/**
 * Processes a message through the complete pipeline with error isolation
 * 
 * Pipeline: analyzeContent → formatPeriodicReport → sendToTelegram
 * 
 * Errors are caught and logged but do not crash the server or affect
 * subsequent message processing.
 * 
 * @param from - Sender phone number
 * @param messageText - Message text content
 * @param telegramConfig - Telegram configuration
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
async function processMessageSafely(
  from: string,
  messageText: string,
  telegramConfig: TelegramConfig
): Promise<void> {
  try {
    // Step 1: Analyze message content to extract structured information
    // Requirement 7.1
    const structuredInfo = analyzeContent(messageText);
    
    // Step 2: Format structured information as journalistic report
    const formattedReport = formatPeriodicReport(structuredInfo);
    
    // Step 3: Send formatted report to Telegram
    // Requirement 7.2
    await sendToTelegram(formattedReport, telegramConfig);
    
    // Log successful processing
    // Requirement 7.4
    console.log(`[INFO] ${new Date().toISOString()} - Message from ${from} processed successfully`);
    
  } catch (error) {
    // Catch and log errors without crashing the server
    // Requirements: 2.6, 7.3, 7.4, 7.5
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to process message from ${from}: ${errorMessage}`);
    
    // Do not throw - allow server to continue processing subsequent messages
    // Requirement 7.5
  }
}
