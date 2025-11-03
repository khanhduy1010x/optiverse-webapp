/**
 * Rating Display & Format Utilities
 * Helper functions cho hiển thị rating data
 */

/**
 * Render star elements
 * @param rating - Rating value (1-5)
 * @returns Array of star JSX elements
 */
export const renderStarsArray = (rating: number): string[] => {
  return Array.from({ length: 5 }).map((_, index) =>
    index < rating ? '★' : '☆',
  );
};

/**
 * Format date to Vietnamese locale
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatRatingDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format average rating with precision
 * @param rating - Rating value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted rating string
 */
export const formatAverageRating = (rating: number, decimals: number = 1): string => {
  return rating.toFixed(decimals);
};

/**
 * Get rating percentage for distribution bar
 * @param count - Number of ratings for this star
 * @param total - Total number of ratings
 * @returns Percentage (0-100)
 */
export const getRatingPercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return (count / total) * 100;
};

/**
 * Get star rating label
 * @param rating - Rating value (1-5)
 * @returns Rating label in Vietnamese
 */
export const getStarLabel = (rating: number): string => {
  const labels: Record<number, string> = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Tuyệt vời',
  };
  return labels[rating] || 'Không hợp lệ';
};

/**
 * Get user display name
 * @param fullName - User full name
 * @param email - User email
 * @returns Display name
 */
export const getUserDisplayName = (fullName?: string, email?: string): string => {
  return fullName || email || 'Ẩn danh';
};

/**
 * Calculate rating quality assessment
 * @param averageRating - Average rating value
 * @returns Quality assessment text
 */
export const getRatingQualityAssessment = (averageRating: number): string => {
  if (averageRating >= 4.5) return 'Xuất sắc';
  if (averageRating >= 4) return 'Rất tốt';
  if (averageRating >= 3) return 'Tốt';
  if (averageRating >= 2) return 'Trung bình';
  if (averageRating >= 1) return 'Yếu';
  return 'Chưa đánh giá';
};

/**
 * Truncate comment to max length
 * @param comment - Comment text
 * @param maxLength - Maximum length
 * @returns Truncated comment with ellipsis if needed
 */
export const truncateComment = (comment: string, maxLength: number = 100): string => {
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + '...';
};

/**
 * Check if rating is recent (within last 7 days)
 * @param dateString - ISO date string
 * @returns Boolean
 */
export const isRecentRating = (dateString: string): boolean => {
  const ratingDate = new Date(dateString).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return ratingDate > sevenDaysAgo;
};

/**
 * Get comment preview for tooltip
 * @param comment - Comment text
 * @param maxLength - Maximum length for preview
 * @returns Preview text
 */
export const getCommentPreview = (
  comment: string,
  maxLength: number = 50,
): string => {
  if (!comment) return 'Không có bình luận';
  if (comment.length <= maxLength) return comment;
  return comment.substring(0, maxLength) + '...';
};

/**
 * Format rating statistics text
 * @param totalRatings - Total number of ratings
 * @returns Formatted text
 */
export const formatRatingStatistics = (totalRatings: number): string => {
  if (totalRatings === 0) return 'Chưa có đánh giá';
  if (totalRatings === 1) return '1 đánh giá';
  return `${totalRatings} đánh giá`;
};
