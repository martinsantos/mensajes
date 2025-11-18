const WORDS_PER_MINUTE = 200;

export function calculateReadTime(text: string): string {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return '1 min read';
  }

  // Split by whitespace and filter out empty strings
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  const minutes = wordCount / WORDS_PER_MINUTE;
  const readTime = Math.ceil(minutes);

  // Ensure minimum read time is 1 minute
  const displayTime = Math.max(1, readTime);

  return `${displayTime} min read`;
}
