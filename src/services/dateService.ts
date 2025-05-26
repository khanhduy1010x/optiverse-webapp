export function formatElapsedTime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  if (days) return `${days} day${days > 1 ? 's' : ''}`;

  if (hours) return `${hours} hour${hours > 1 ? 's' : ''}`;

  if (minutes) return `${minutes} minute${minutes > 1 ? 's' : ''}`;

  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
