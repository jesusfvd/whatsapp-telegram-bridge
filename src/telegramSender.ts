/**
 * Telegram Sender Module
 * 
 * Handles sending formatted messages to Telegram using the Bot API.
 * Manages API communication, error handling, and response logging.
 */

/**
 * Configuration for Telegram API communication
 * 
 * Requirements: 5.1
 */
export interface TelegramConfig {
  /** Telegram Bot API token */
  botToken: string;
  
  /** Target chat/group ID where messages will be sent */
  chatId: string;
}

/**
 * Payload structure for Telegram sendMessage API endpoint
 */
interface TelegramSendMessagePayload {
  chat_id: string;
  text: string;
  parse_mode: 'HTML' | 'Markdown';
}

/**
 * Telegram API error response structure
 */
interface TelegramErrorResponse {
  ok: false;
  error_code: number;
  description: string;
}

/**
 * Sends a formatted message to Telegram using the Bot API
 * 
 * Constructs the proper API URL, creates the payload with required fields,
 * and handles both successful and error responses with appropriate logging
 * and error enrichment.
 * 
 * @param message - The formatted message text to send
 * @param config - Telegram configuration (bot token and chat ID)
 * @throws Error with enriched details if the API request fails
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 7.6
 */
export async function sendToTelegram(
  message: string,
  config: TelegramConfig
): Promise<void> {
  console.log('[DEBUG] sendToTelegram called');
  console.log('[DEBUG] Chat ID:', config.chatId);
  console.log('[DEBUG] Bot Token (first 10 chars):', config.botToken.substring(0, 10) + '...');
  console.log('[DEBUG] Message length:', message.length);
  
  // Construct Telegram API URL with bot token
  // Requirement 5.8
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  // Create payload with all required fields
  // Requirements: 5.3, 5.4, 5.5
  const payload: TelegramSendMessagePayload = {
    chat_id: config.chatId,
    text: message,
    parse_mode: 'HTML'
  };

  console.log('[DEBUG] Payload:', JSON.stringify(payload, null, 2));

  try {
    console.log('[DEBUG] Sending request to Telegram API...');
    
    // Send POST request to Telegram API
    // Requirement 5.2
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[DEBUG] Response status:', response.status);
    console.log('[DEBUG] Response ok:', response.ok);

    // Handle error responses by throwing enriched error
    // Requirements: 5.7, 7.6
    if (!response.ok) {
      let errorDescription = 'Unknown error';
      
      try {
        const errorData = await response.json() as TelegramErrorResponse;
        errorDescription = errorData.description || errorDescription;
        console.log('[ERROR] Telegram API error response:', JSON.stringify(errorData, null, 2));
      } catch {
        // If parsing error response fails, use generic message
        errorDescription = await response.text() || errorDescription;
        console.log('[ERROR] Telegram API error text:', errorDescription);
      }

      // Throw error with status code and description
      // Requirement 7.6
      throw new Error(
        `Telegram API error [${response.status}]: ${errorDescription}`
      );
    }

    // Log successful message delivery
    // Requirement 5.6
    console.log('[INFO] Message sent to Telegram successfully');
    
  } catch (error) {
    console.log('[ERROR] Exception caught in sendToTelegram:', error);
    
    // Re-throw enriched errors as-is
    if (error instanceof Error && error.message.includes('Telegram API error')) {
      throw error;
    }
    
    // Enrich network/fetch errors with context
    // Requirement 7.6
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Network error sending to Telegram: ${errorMessage}`);
  }
}
