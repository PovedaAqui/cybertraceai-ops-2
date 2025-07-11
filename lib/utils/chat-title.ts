/**
 * Generate a meaningful chat title from the first user message
 * @param message The user's first message
 * @returns A shortened, meaningful title for the chat
 */
export function generateChatTitle(message: string): string {
  if (!message || message.trim().length === 0) {
    return "New Chat";
  }

  // Clean the message
  const cleanMessage = message.trim();
  
  // If message is short enough, use it as is
  if (cleanMessage.length <= 40) {
    return cleanMessage;
  }

  // Try to find a good breaking point (sentence end, comma, etc.)
  const breakPoints = ['. ', '? ', '! ', ', ', '; ', ' - ', ' and ', ' with ', ' for '];
  
  for (const breakPoint of breakPoints) {
    const index = cleanMessage.indexOf(breakPoint);
    if (index > 15 && index <= 35) {
      return cleanMessage.substring(0, index);
    }
  }

  // Find the last space before 35 characters to avoid cutting words
  let cutPoint = 35;
  for (let i = 35; i >= 15; i--) {
    if (cleanMessage[i] === ' ') {
      cutPoint = i;
      break;
    }
  }

  return cleanMessage.substring(0, cutPoint).trim() + "...";
}

/**
 * Check if a title is a generic/default title that should be updated
 * @param title The current chat title
 * @returns true if the title should be updated
 */
export function shouldUpdateTitle(title: string | null): boolean {
  const genericTitles = [
    "New Chat",
    "new chat",
    "Chat",
    "chat",
    "",
    null,
    undefined
  ];
  
  return genericTitles.includes(title) || !title || title.trim().length === 0;
}