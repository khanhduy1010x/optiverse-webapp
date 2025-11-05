import React from 'react';
import { useRatingForm } from '../../hooks/marketplace/useRatingForm';
import { renderStarsArray } from '../../utils/rating.display';
import { formatRatingDisplay } from '../../utils/rating.validation';
import { RatingErrorModal } from './RatingErrorModal.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface RatingFormProps {
  marketplaceId: string;
  onRatingCreated?: () => void;
  existingRating?: {
    _id: string;
    rating: number;
    comment?: string;
  };
  onRatingUpdated?: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  marketplaceId,
  onRatingCreated,
  existingRating,
  onRatingUpdated,
}) => {
  const { t } = useAppTranslate('marketplace');
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const {
    rating,
    comment,
    loading,
    hoverRating,
    error,
    setRating,
    setComment,
    setHoverRating,
    handleSubmit: onSubmit,
    isFormValid,
    getRemainingChars,
  } = useRatingForm(existingRating, () => {
    existingRating ? onRatingUpdated?.() : onRatingCreated?.();
  });

  React.useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(marketplaceId, existingRating?._id);
  };

  return (
    <div className="rating-form p-4 border border-gray-200 rounded-lg">
      <h3 className="text-base font-semibold mb-3">
        {existingRating ? t('update_rating') : t('write_review')}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('rating_label')} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <span
                  className={`text-2xl ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {rating > 0 ? `${rating} ${rating > 1 ? t('stars') : t('star')}` : t('not_selected')}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('comment_label')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('comment_placeholder')}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 {t('characters')}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-blue-600 text-white py-1.5 px-3 text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('processing') : existingRating ? t('update_rating') : t('submit_review')}
        </button>
      </form>

      {/* Error Modal */}
      <RatingErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
        autoCloseMs={3000}
      />
    </div>
  );
};
