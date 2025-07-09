import { tool } from 'ai';
import { z } from 'zod';

/**
 * Converts a UNIX epoch timestamp (in milliseconds) to a human-readable datetime string.
 * 
 * @param timestamp_ms - The UNIX epoch timestamp in milliseconds
 * @param tz - The target timezone (e.g., 'America/New_York', 'Europe/London'). Defaults to 'UTC'
 * @returns A string representing the human-readable datetime in the specified timezone,
 *          formatted as YYYY-MM-DD HH:MM:SS ZZZ.
 *          Returns an error message string if conversion fails.
 */
export function humanizeTimestamp(timestamp_ms: number, tz: string = 'UTC'): string {
  try {
    // Convert milliseconds to seconds and create Date object
    const date = new Date(Math.floor(timestamp_ms));
    
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }
    
    // Create formatter for the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    // Format the date
    const partsMap = Object.fromEntries(
      formatter.formatToParts(date).map(part => [part.type, part.value])
    ) as Record<string, string>;
    
    // Get timezone abbreviation
    const tzAbbr = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value ?? tz;
    
    // Format as YYYY-MM-DD HH:MM:SS ZZZ
    return `${partsMap.year}-${partsMap.month}-${partsMap.day} ${partsMap.hour}:${partsMap.minute}:${partsMap.second} ${tzAbbr}`;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error converting timestamp ${timestamp_ms} to timezone ${tz}: ${errorMessage}`;
  }
}

// Tool definition using the AI SDK helper
export const humanizeTimestampTool = tool({
  description:
    'Converts a UNIX epoch timestamp (in milliseconds) to a human-readable datetime string.',
  parameters: z.object({
    timestamp_ms: z.number({ description: 'The UNIX epoch timestamp in milliseconds.' }),
    tz: z.string({ description: 'The target timezone (e.g., "America/New_York").' }).default('UTC'),
  }),
   
  execute: async ({ timestamp_ms, tz = 'UTC' }) => humanizeTimestamp(timestamp_ms, tz),
});

// Note: Example usage removed to avoid reference errors when this file is loaded in an ESM context (e.g., Next.js server runtime). 