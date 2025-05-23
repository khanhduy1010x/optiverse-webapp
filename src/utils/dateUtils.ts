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