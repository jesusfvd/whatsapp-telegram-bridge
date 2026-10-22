/**
 * Telegram Formatter Component
 * 
 * Converts structured information into human-readable journalistic reports
 * formatted for Telegram delivery.
 */

/**
 * Structured information extracted from WhatsApp messages
 */
export interface StructuredInfo {
  que_paso: string;    // Description of the event
  donde: string;       // Location information
  cuando: string;      // Temporal information
  nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'crítico';
}

/**
 * Formats structured information into a journalistic report
 * 
 * Creates a formatted report with:
 * - Header with emojis and title
 * - "¿Qué pasó?" section with event description
 * - "¿Dónde?" section with 📍 emoji and location
 * - "¿Cuándo?" section with ⏰ emoji and time
 * - "Nivel de urgencia" section with color-coded emoji
 * - Visual separator at the end
 * 
 * @param info - Structured information to format
 * @returns Formatted journalistic report as string
 */
export function formatPeriodicReport(info: StructuredInfo): string {
  // Map urgency level to corresponding emoji
  const urgencyEmoji: Record<StructuredInfo['nivel_urgencia'], string> = {
    'crítico': '🔴',
    'alto': '🟠',
    'medio': '🟡',
    'bajo': '🟢'
  };

  // Get the appropriate emoji for the urgency level, fallback to white circle
  const emoji = urgencyEmoji[info.nivel_urgencia] || '⚪';

  // Construct the formatted report
  return `📰 ═══════════════════════
   REPORTE PERIODÍSTICO
═══════════════════════ 📰

📋 ¿Qué pasó?
${info.que_paso}

📍 ¿Dónde?
${info.donde}

⏰ ¿Cuándo?
${info.cuando}

🔔 Nivel de urgencia: ${emoji} ${info.nivel_urgencia}

═══════════════════════`;
}
