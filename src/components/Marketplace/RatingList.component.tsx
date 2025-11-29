import React, { useState } from 'react';
import { useRatingList } from '../../hooks/marketplace/useRatingList';
import { Rating } from '../../services/rating.service';
import ratingService from '../../services/rating.service';
import { formatRatingDate, getRatingPercentage, getStarLabel, getUserDisplayName } from '../../utils/rating.display';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface RatingListProps {
  marketplaceId: string;
  onRatingDeleted?: () => void;
}

interface EditingRating extends Rating {
  tempRating: number;
  tempComment: string;
}

export const RatingList: React.FC<RatingListProps> = ({
  marketplaceId,
  onRatingDeleted,
}) => {
  const { t } = useAppTranslate('marketplace');
  const {
    ratings,
    stats,
    loading,
    page,
    total,
    limit,
    deletingRatingId,
    setPage,
    deleteRating,
    confirmDelete,
    cancelDelete,
    hasNextPage,
    hasPreviousPage,
    getTotalPages,
  } = useRatingList(marketplaceId, onRatingDeleted);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState<EditingRating | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getCurrentUserId = (): string | null => {
    return localStorage.getItem('user_id');
  };

  const isOwnRating = (rating: Rating): boolean => {
    const currentUserId = getCurrentUserId();
    return currentUserId === rating.user_id;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const handleEditClick = (rating: Rating) => {
    setEditingId(rating._id);
    setEditingRating({
      ...rating,
      tempRating: rating.rating,
      tempComment: rating.comment || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRating(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRating) return;

    setUpdatingId(editingRating._id);
    try {
      await ratingService.update(editingRating._id, {
        rating: editingRating.tempRating,
        comment: editingRating.tempComment,
      });

      // Update local state
      const updatedRatings = ratings.map((r) =>
        r._id === editingRating._id
          ? {
              ...r,
              rating: editingRating.tempRating,
              comment: editingRating.tempComment,
              updatedAt: new Date().toISOString(),
            }
          : r,
      );

      // Update ratings in parent hook state
      (ratings as any).length = 0;
      (ratings as any).push(...updatedRatings);

      toast.success('Rating updated successfully');
      setEditingId(null);
      setEditingRating(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Không thể cập nhật đánh giá';
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteClick = (ratingId: string) => {
    setDeleteError(null);
    deleteRating(ratingId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRatingId) return;

    setDeleteError(null);
    const success = await confirmDelete(deletingRatingId);
    
    if (!success) {
      try {
        // Try to delete again to get error message
        await ratingService.delete(deletingRatingId);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Không thể xóa đánh giá';
        setDeleteError(errorMessage);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteError(null);
    cancelDelete();
  };

  const RatingStatsBar = () => {
    if (!stats) return null;

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.totalRatings} ratings
            </p>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0;
              const percentage = getRatingPercentage(
                count,
                stats.totalRatings,
              );

              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium w-6">{star}⭐</span>
                  <div className="flex-1 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const RatingItem = ({ rating }: { rating: Rating }) => {
    const isEditing = editingId === rating._id;

    if (isEditing && editingRating) {
      return (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rating_label')}: {editingRating.tempRating} ⭐
              </label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setEditingRating({
                        ...editingRating,
                        tempRating: index + 1,
                      })
                    }
                    className={`text-3xl transition-colors ${
                      index < editingRating.tempRating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('comment_label')}
              </label>
              <textarea
                value={editingRating.tempComment}
                onChange={(e) =>
                  setEditingRating({
                    ...editingRating,
                    tempComment: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter comment..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                disabled={updatingId === rating._id}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updatingId === rating._id}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingId === rating._id ? t('processing') : t('save')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow overflow-hidden">
        <div className="flex justify-between items-start gap-4 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(rating.rating)}</div>
              <span className="text-xs text-gray-500 ml-2">
                {formatRatingDate(rating.createdAt)}
              </span>
            </div>

            {rating.user_info && (
              <div className="flex items-center gap-2">
                {rating.user_info.avatar_url && (
                  <img
                    src={rating.user_info.avatar_url}
                    alt={rating.user_info.full_name || rating.user_info.email}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p className="text-sm font-medium text-gray-700">
                  {getUserDisplayName(rating.user_info.full_name, rating.user_info.email)}
                </p>
              </div>
            )}

            {rating.comment && (
              <p className="text-gray-600 mt-2 text-sm break-words whitespace-pre-wrap">{rating.comment}</p>
            )}
          </div>

          {/* Action Buttons - Only show for own ratings */}
          {isOwnRating(rating) && (
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => handleEditClick(rating)}
                className="px-3 py-1 text-sm text-black hover:text-gray-600 transition-colors whitespace-nowrap"
                title={t('edit')}
              >
                {t('edit')}
              </button>
              <button
                onClick={() => handleDeleteClick(rating._id)}
                className="px-3 py-1 text-sm text-black hover:text-gray-600 transition-colors whitespace-nowrap"
                title={t('delete')}
              >
                {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!deletingRatingId) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {t('confirm_delete_rating')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('are_you_sure_delete_rating')}
          </p>
          
          {deleteError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600 mt-1">{deleteError}</p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && ratings.length === 0) {
    return <div className="text-center py-8 text-gray-500">{t('loading_reviews')}</div>;
  }

  if (ratings.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('no_reviews')}
      </div>
    );
  }

  return (
    <div className="ratings-list">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* Rating Stats */}
      <RatingStatsBar />

      {/* Ratings */}
      <h3 className="text-lg font-semibold mb-4">{t('reviews')} ({total})</h3>

      {ratings.map((rating) => (
        <RatingItem key={rating._id} rating={rating} />
      ))}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!hasPreviousPage()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {t('previous')}
          </button>

          <span className="px-4 py-2 text-gray-600">
            {t('page')} {page} / {getTotalPages()}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
};
