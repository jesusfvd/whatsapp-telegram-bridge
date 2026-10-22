/**
 * Configuration management module
 * Loads and validates environment variables for the bridge server
 * Uses native fs/path modules to parse .env file manually (no external dependencies)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  port: number;
  whatsappVerifyToken: string;
  telegramBotToken: string;
  telegramChatId: string;
}

/**
 * Manually loads and parses the .env file from the project root
 * Assigns variables to process.env
 */
function loadEnvFile(): void {
  try {
    // Find the .env file in the project root
    const envPath = path.resolve(process.cwd(), '.env');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.warn('WARNING: .env file not found, using existing environment variables');
      return;
    }

    // Read .env file content as text
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Parse the content line by line
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // Trim whitespace
      const trimmedLine = line.trim();
      
      // Ignore empty lines and comments (lines starting with #)
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Split by the first = sign
      const equalSignIndex = trimmedLine.indexOf('=');
      
      if (equalSignIndex === -1) {
        // No = sign found, skip this line
        continue;
      }
      
      // Extract key and value
      const key = trimmedLine.substring(0, equalSignIndex).trim();
      let value = trimmedLine.substring(equalSignIndex + 1).trim();
      
      // Remove surrounding quotes if present (both single and double)
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      
      // Assign to process.env only if key is valid
      if (key) {
        process.env[key] = value;
      }
    }
    
    console.log('[INFO] Successfully loaded .env file');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`ERROR: Failed to load .env file: ${errorMessage}`);
    // Don't exit here, continue with existing environment variables
  }
}

/**
 * Loads configuration from environment variables
 * @returns {Config} Validated configuration object
 * @throws {Error} Exits process if required environment variables are missing or empty
 */
export function loadConfig(): Config {
  // First, load the .env file manually
  loadEnvFile();
  
  // Define required environment variables
  const requiredVars = {
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
  };

  // Collect missing or empty variables
  const missing: string[] = [];
  
  for (const [name, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === '') {
      missing.push(name);
    }
  }

  // Fail fast if any required variables are missing
  if (missing.length > 0) {
    console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Server cannot start without required configuration.');
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Parse PORT with default value of 3000
  const port = parseInt(process.env.PORT || '3000', 10);

  // Return typed Config object
  return {
    port,
    whatsappVerifyToken: requiredVars.WHATSAPP_VERIFY_TOKEN!,
    telegramBotToken: requiredVars.TELEGRAM_BOT_TOKEN!,
    telegramChatId: requiredVars.TELEGRAM_CHAT_ID!
  };
}
