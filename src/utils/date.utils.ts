export const formatDateTime = (isoString: string): string => {
  if (!isoString || isNaN(Date.parse(isoString))) {
    return '';
  }
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date).replace(',', '');
};
export const formatDateTimeFull = (isoString: string): string => {
  if (!isoString || isNaN(Date.parse(isoString))) {
    return '';
  }
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(date);
};

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
