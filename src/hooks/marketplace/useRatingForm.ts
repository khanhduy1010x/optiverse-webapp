/**
 * Hook để quản lý logic form đánh giá
 * Xử lý state, validation và submission
 */

import { useState, useCallback } from 'react';
import ratingService, { CreateRatingPayload, UpdateRatingPayload } from '../../services/rating.service';
import { validateRatingForm, isValidRatingForSubmission } from '../../utils/rating.validation';

export interface UseRatingFormState {
  rating: number;
  comment: string;
  loading: boolean;
  hoverRating: number;
  error: string | null;
}

export interface UseRatingFormActions {
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  setHoverRating: (hoverRating: number) => void;
  resetForm: () => void;
  handleSubmit: (
    marketplaceId: string,
    existingRatingId?: string,
  ) => Promise<boolean>;
  isFormValid: () => boolean;
  getRemainingChars: () => number;
}

/**
 * Custom hook để quản lý rating form logic
 * @param existingRating - Existing rating data if editing
 * @param onSuccess - Callback when submission succeeds
 * @returns State và actions
 */
export const useRatingForm = (
  existingRating?: {
    _id: string;
    rating: number;
    comment?: string;
  },
  onSuccess?: () => void,
): UseRatingFormState & UseRatingFormActions => {
  const [rating, setRating] = useState<number>(existingRating?.rating || 0);
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_COMMENT_LENGTH = 500;

  /**
   * Kiểm tra form hợp lệ
   */
  const isFormValid = useCallback((): boolean => {
    return isValidRatingForSubmission(rating);
  }, [rating]);

  /**
   * Lấy số ký tự còn lại
   */
  const getRemainingChars = useCallback((): number => {
    return MAX_COMMENT_LENGTH - comment.length;
  }, [comment]);

  /**
   * Reset form về trạng thái ban đầu
   */
  const resetForm = useCallback((): void => {
    setRating(0);
    setComment('');
    setError(null);
  }, []);

  /**
   * Xử lý submit form
   */
  const handleSubmit = useCallback(
    async (marketplaceId: string, existingRatingId?: string): Promise<boolean> => {
      try {
        // Validate form
        const validationErrors = validateRatingForm(rating, comment, marketplaceId);
        if (validationErrors.length > 0) {
          const errorMessage = validationErrors
            .map((err) => err.message)
            .join(', ');
          setError(errorMessage);
          return false;
        }

        setLoading(true);
        setError(null);

        // Call API
        if (existingRatingId) {
          // Update existing rating
          const updatePayload: UpdateRatingPayload = {
            rating,
            comment: comment || undefined,
          };
          await ratingService.update(existingRatingId, updatePayload);
        } else {
          // Create new rating
          const createPayload: CreateRatingPayload = {
            marketplace_id: marketplaceId,
            rating,
            comment: comment || undefined,
          };
          await ratingService.create(createPayload);
          resetForm();
        }

        onSuccess?.();
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Unable to submit rating';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [rating, comment, onSuccess, resetForm],
  );

  return {
    // State
    rating,
    comment,
    loading,
    hoverRating,
    error,
    // Actions
    setRating,
    setComment,
    setHoverRating,
    resetForm,
    handleSubmit,
    isFormValid,
    getRemainingChars,
  };
};
