/**
 * Rating Validation Utilities
 * Tập trung tất cả các logic validation cho rating
 */

export interface RatingValidationError {
  field: string;
  message: string;
}

/**
 * Validate rating value
 * @param rating - Rating value (1-5)
 * @returns Error message if invalid, empty string if valid
 */
export const validateRating = (rating: number): string => {
  if (rating === 0 || rating === undefined) {
    return 'Vui lòng chọn số sao';
  }
  if (rating < 1 || rating > 5) {
    return 'Số sao phải từ 1 đến 5';
  }
  return '';
};

/**
 * Validate comment
 * @param comment - Comment text
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Error message if invalid, empty string if valid
 */
export const validateComment = (comment: string, maxLength: number = 500): string => {
  if (comment && comment.length > maxLength) {
    return `Bình luận không được vượt quá ${maxLength} ký tự`;
  }
  return '';
};

/**
 * Validate marketplace ID
 * @param marketplaceId - Marketplace item ID
 * @returns Error message if invalid, empty string if valid
 */
export const validateMarketplaceId = (marketplaceId: string): string => {
  if (!marketplaceId) {
    return 'Marketplace ID không được để trống';
  }
  // Simple MongoDB ObjectId format check (24 hex characters)
  if (!/^[0-9a-f]{24}$/i.test(marketplaceId)) {
    return 'Marketplace ID không hợp lệ';
  }
  return '';
};

/**
 * Validate rating ID
 * @param ratingId - Rating ID
 * @returns Error message if invalid, empty string if valid
 */
export const validateRatingId = (ratingId: string): string => {
  if (!ratingId) {
    return 'Rating ID không được để trống';
  }
  if (!/^[0-9a-f]{24}$/i.test(ratingId)) {
    return 'Rating ID không hợp lệ';
  }
  return '';
};

/**
 * Validate entire rating form
 * @param rating - Rating value
 * @param comment - Comment text
 * @param marketplaceId - Marketplace item ID
 * @returns Array of validation errors
 */
export const validateRatingForm = (
  rating: number,
  comment: string,
  marketplaceId: string,
): RatingValidationError[] => {
  const errors: RatingValidationError[] = [];

  const ratingError = validateRating(rating);
  if (ratingError) {
    errors.push({ field: 'rating', message: ratingError });
  }

  const commentError = validateComment(comment);
  if (commentError) {
    errors.push({ field: 'comment', message: commentError });
  }

  const marketplaceError = validateMarketplaceId(marketplaceId);
  if (marketplaceError) {
    errors.push({ field: 'marketplaceId', message: marketplaceError });
  }

  return errors;
};

/**
 * Check if rating is valid for submission
 * @param rating - Rating value
 * @returns Boolean indicating if rating is valid
 */
export const isValidRatingForSubmission = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

/**
 * Format rating for display
 * @param rating - Rating value
 * @returns Formatted rating string
 */
export const formatRatingDisplay = (rating: number): string => {
  if (rating === 0) return 'Chưa chọn';
  if (rating === 1) return '1 sao - Rất tệ';
  if (rating === 2) return '2 sao - Tệ';
  if (rating === 3) return '3 sao - Bình thường';
  if (rating === 4) return '4 sao - Tốt';
  if (rating === 5) return '5 sao - Tuyệt vời';
  return 'Không hợp lệ';
};

/**
 * Get rating color for UI display
 * @param rating - Rating value
 * @returns Color class string
 */
export const getRatingColor = (rating: number): string => {
  if (rating <= 1) return 'text-red-500';
  if (rating <= 2) return 'text-orange-500';
  if (rating <= 3) return 'text-yellow-500';
  if (rating <= 4) return 'text-lime-500';
  return 'text-green-500';
};

/**
 * Get rating background color for UI display
 * @param rating - Rating value
 * @returns Background color class string
 */
export const getRatingBackgroundColor = (rating: number): string => {
  if (rating <= 1) return 'bg-red-50';
  if (rating <= 2) return 'bg-orange-50';
  if (rating <= 3) return 'bg-yellow-50';
  if (rating <= 4) return 'bg-lime-50';
  return 'bg-green-50';
};

/**
 * Check if comment is empty or whitespace only
 * @param comment - Comment text
 * @returns Boolean
 */
export const isCommentEmpty = (comment: string): boolean => {
  return comment.trim().length === 0;
};
