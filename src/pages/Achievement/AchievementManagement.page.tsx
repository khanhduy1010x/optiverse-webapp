import React from 'react';
import { useAchievementManagement } from '../../hooks/achievement/useAchievementManagement';
import Button from '../../components/common/Button.component';
import AchievementFormModal from '../../components/achievement/AchievementFormModal.component';
import { AchievementFormData } from '../../types/achievement/request/achievement.request';
import RuleFormModal from '../../components/achievement/RuleFormModal.component';
import AchievementCard from '../../components/achievement/AchievementCard.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AchievementManagement: React.FC = () => {
  const { t } = useAppTranslate('achievement');
  const {
    // State
    achievements,
    loading,
    error,
    fieldErrors,
    showForm,
    editingAchievement,
    deleteConfirm,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,

    // Actions
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleFormCancel,
    setDeleteConfirm,
    clearError,
    setCurrentPage
  } = useAchievementManagement();

  // Calculate paginated achievements
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAchievements = achievements.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('achievement_title')}</h1>
        <Button
          title={t('create_new_achievement')}
          onClick={handleCreate}
          style={{ backgroundColor: '#21b4ca', color: '#fff' }}
          className="px-6 py-2 rounded-lg font-medium shadow-md hover:opacity-90 transition-all"
        />


      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}

      {!achievements || achievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white/70">
          <p className="text-gray-600">{t('no_achievements_yet')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement._id}
                achievement={achievement}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Achievement Form Modal */}
      <AchievementFormModal
        isOpen={showForm}
        achievement={editingAchievement}
        onSubmit={(data: AchievementFormData) => handleFormSubmit(data)}
        onCancel={handleFormCancel}
        externalFieldErrors={fieldErrors}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-600">
                  <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">{t('confirm_deletion')}</h3>
              <p className="text-sm text-gray-600 text-center mt-1">
                {t('are_you_sure_delete')}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementManagement;