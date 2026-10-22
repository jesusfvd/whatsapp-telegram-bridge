/**
 * Content Analyzer Module
 * 
 * Processes incoming WhatsApp messages to extract structured journalistic information.
 * This initial implementation uses simulated analysis that will be replaced with
 * actual AI/NLP services in the future.
 */

/**
 * Structured information extracted from a message.
 * Represents the key journalistic questions: what, where, when, and urgency level.
 * 
 * Requirements: 3.2, 3.4, 3.5, 3.6, 3.7
 */
export interface StructuredInfo {
  /** Description of what happened (the event) */
  que_paso: string;
  
  /** Location information (where it happened) */
  donde: string;
  
  /** Temporal information (when it happened) */
  cuando: string;
  
  /** Urgency level classification */
  nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'crítico';
}

/**
 * Analyzes message text to extract structured journalistic information.
 * 
 * This is a simulated analysis implementation that uses heuristics based on
 * keywords and message characteristics. In production, this would be replaced
 * with actual NLP/AI analysis services.
 * 
 * @param messageText - The text content of the WhatsApp message
 * @returns StructuredInfo object with extracted information
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.8
 */
export function analyzeContent(messageText: string): StructuredInfo {
  // Handle empty or whitespace-only messages with fallback values
  // Requirement 3.8
  if (!messageText || messageText.trim() === '') {
    return {
      que_paso: 'Información no disponible',
      donde: 'Ubicación no especificada',
      cuando: 'Tiempo no especificado',
      nivel_urgencia: 'bajo'
    };
  }

  // Simulated urgency level detection based on keywords and message length
  // Requirement 3.7
  const urgencyLevel = determineUrgencyLevel(messageText);

  // Generate timestamp in Spanish locale
  const timestamp = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Simulated extraction - extract first 100 chars for event description
  const eventDescription = messageText.length > 100
    ? `Evento reportado: ${messageText.substring(0, 100)}...`
    : `Evento reportado: ${messageText}`;

  // Return structured information with all required fields
  // Requirements: 3.2, 3.4, 3.5, 3.6, 3.7
  return {
    que_paso: eventDescription,
    donde: 'Ubicación extraída del mensaje',
    cuando: timestamp,
    nivel_urgencia: urgencyLevel
  };
}

/**
 * Determines the urgency level based on message characteristics.
 * 
 * Heuristics:
 * - Contains urgent keywords → crítico
 * - Long message (>200 chars) → alto
 * - Default → medio
 * 
 * @param messageText - The message text to analyze
 * @returns Urgency level classification
 */
function determineUrgencyLevel(messageText: string): StructuredInfo['nivel_urgencia'] {
  const lowerText = messageText.toLowerCase();
  
  // Check for critical urgency keywords
  const criticalKeywords = ['urgente', 'ahora', 'emergencia', 'inmediato', 'crítico'];
  const hasCriticalKeyword = criticalKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasCriticalKeyword) {
    return 'crítico';
  }
  
  // Long messages may indicate more serious events
  if (messageText.length > 200) {
    return 'alto';
  }
  
  // Default to medium urgency for normal messages
  return 'medio';
}
