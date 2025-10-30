/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean up extra whitespace
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Truncate text to a specific length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Strip HTML tags and truncate text in one function
 * @param html - HTML string to process
 * @param maxLength - Maximum length before truncation
 * @returns Plain text, truncated if necessary
 */
export const stripAndTruncate = (html: string, maxLength: number = 100): string => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};