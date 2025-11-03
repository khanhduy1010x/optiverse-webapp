/**
 * Format number to Vietnamese Dong (VND) currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show VND symbol (default: true)
 * @returns Formatted string e.g., "100,000 VND" or "100,000"
 */
export const formatVND = (
  amount: number,
  showSymbol: boolean = true
): string => {
  if (!amount && amount !== 0) return '0 VND';

  // Format number with thousand separators
  const formattedAmount = Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return showSymbol ? `${formattedAmount} VND` : formattedAmount;
};

/**
 * Format number to currency with comma separator
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string e.g., "100,000.00"
 */
export const formatCurrency = (
  amount: number,
  decimals: number = 0
): string => {
  if (!amount && amount !== 0) return '0';

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format number to Vietnamese format with thousand separators
 * @param amount - The amount to format
 * @returns Formatted string e.g., "100,000"
 */
export const formatNumber = (amount: number): string => {
  if (!amount && amount !== 0) return '0';

  return amount.toLocaleString('vi-VN');
};

/**
 * Parse VND string to number
 * @param vndString - VND formatted string e.g., "100,000 VND"
 * @returns Number value e.g., 100000
 */
export const parseVND = (vndString: string): number => {
  if (!vndString) return 0;

  // Remove all non-digit characters except decimal point
  const cleaned = vndString.replace(/[^\d.-]/g, '');
  return parseInt(cleaned, 10) || 0;
};
