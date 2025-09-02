import React, { useState, useEffect } from 'react';
import AchievementCard from '../../components/achievement/AchievementCard.component';
import Loader from '../../components/achievement/Loader.component';
import ErrorDisplay from '../../components/achievement/ErrorDisplay.component';
import { useAdminAchievements } from '../../hooks/admin/useAdminAchievements.hook';
import { Achievement, ConditionTypeEnum } from '../../types/achievement/achievement.type';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AchievementsAdminPage: React.FC = () => {
  const { t } = useAppTranslate('achievement');
  const [previewImageEdit, setPreviewImageEdit] = useState<string | null>(null);
  const [previewImageCreate, setPreviewImageCreate] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const {
    achievements,
    loading,
    error,
    editingId,
    editTitle,
    editDescription,
    saving,
    validationError,
    handleEdit,
    handleCancel,
    handleSave,
    setEditTitle,
    setEditDescription,
    // create logic
    createModalOpen,
    openCreateModal,
    closeCreateModal,
    createTitle,
    setCreateTitle,
    createDescription,
    setCreateDescription,
    createConditionType,
    setCreateConditionType,
    createConditionValue,
    setCreateConditionValue,
    createLoading,
    createValidationError,
    handleCreate,
    setEditIconFile,
    setCreateIconFile,
    fetchAchievements,
  } = useAdminAchievements();

  // Clear network error when component mounts or when modals change
  useEffect(() => {
    setNetworkError(null);
  }, [editingId, createModalOpen]);

  // Reset preview images when edit modal is closed
  useEffect(() => {
    if (!editingId) {
      setPreviewImageEdit(null);
    }
  }, [editingId]);

  // Reset preview images when create modal is closed
  useEffect(() => {
    if (!createModalOpen) {
      setPreviewImageCreate(null);
    }
  }, [createModalOpen]);

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditIconFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageEdit(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImageEdit(null);
    }
  };

  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCreateIconFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageCreate(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImageCreate(null);
    }
  };

  const resetModals = () => {
    setPreviewImageEdit(null);
    setPreviewImageCreate(null);
    setNetworkError(null);
    handleCancel();
    closeCreateModal();
  };

  // Handle edit with preview reset
  const onEditAchievement = (achievement: Achievement) => {
    // Set preview image to the existing icon if available
    if (achievement.icon_url || achievement.badge_image) {
      setPreviewImageEdit(achievement.icon_url || achievement.badge_image || null);
    } else {
      setPreviewImageEdit(null);
    }
    setEditIconFile(null);
    handleEdit(achievement);
  };

  // Handle create modal open with preview reset
  const onOpenCreateModal = () => {
    // Reset preview image before opening create modal
    setPreviewImageCreate(null);
    setCreateIconFile(null);
    openCreateModal();
  };

  // Handle save with network error handling
  const handleSaveWithErrorHandling = async () => {
    setNetworkError(null);
    try {
      await handleSave();
    } catch (err: any) {
      if (err.message?.includes('EAI_AGAIN') || err.code === 'EAI_AGAIN') {
        setNetworkError(t('network_connectivity_issue_upload'));
      }
    }
  };

  // Handle create with network error handling
  const handleCreateWithErrorHandling = async () => {
    setNetworkError(null);
    try {
      await handleCreate();
    } catch (err: any) {
      if (err.message?.includes('EAI_AGAIN') || err.code === 'EAI_AGAIN') {
        setNetworkError(t('network_connectivity_issue_upload'));
      }
    }
  };

  // Retry loading achievements
  const handleRetry = () => {
    setNetworkError(null);
    fetchAchievements();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('achievements_management')}</h1>
        <button
          className="bg-blue-500 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-600 shadow"
          onClick={onOpenCreateModal}
        >
          {t('create_achievement_button')}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <Loader />
        ) : error ? (
          <div>
            <ErrorDisplay error={error} />
            <button 
              onClick={handleRetry}
              className="mt-4 bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600"
            >
              {t('retry')}
            </button>
          </div>
        ) : (
          <>
            {achievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('empty_list_message')}
              </div>
            ) : (
              <div className="flex flex-wrap">
                {achievements.map((achievement) => (
                  <div key={achievement._id} className="relative m-2">
                    <AchievementCard achievement={achievement} unlocked={true} />
                    <button
                      className="absolute top-2 right-2 bg-blue-500 text-white rounded px-2 py-1 text-xs hover:bg-blue-600"
                      onClick={() => onEditAchievement(achievement)}
                    >
                      {t('edit')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal Popup */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[2000]">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-lg relative animate-fadeIn">
            <h2 className="text-base font-bold mb-6 flex items-center text-gray-800">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('edit_achievement_title')}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <input
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder={t('enter_achievement_title')}
                  />
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('title_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <textarea
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent resize-none"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder={t('enter_achievement_description')}
                    rows={1}
                  />
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('description_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center mb-2">
                <div className="relative mr-3">
                  <label className="text-xs text-blue-500 font-medium tracking-wider mb-1 block">{t('icon_label')}</label>
                  {!previewImageEdit ? (
                    <div className="mt-1 flex items-center">
                      <label className="flex items-center justify-center w-20 h-20 border border-dashed border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <input 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-1 w-20 h-20 relative">
                      <img 
                        src={previewImageEdit} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button 
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setPreviewImageEdit(null);
                          setEditIconFile(null);
                        }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-xs text-gray-500 tracking-wider pl-2">
                  {t('square_image_recommended')}
                </div>
              </div>
            </div>
            
            {validationError && (
              <div className="mt-3 p-2 bg-red-50 text-red-500 text-xs rounded-md flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {validationError}
              </div>
            )}

            {networkError && (
              <div className="mt-3 p-2 bg-red-50 text-red-500 text-xs rounded-md flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {networkError}
              </div>
            )}
            
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="px-4 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                onClick={resetModals}
                disabled={saving}
              >
                {t('cancel')}
              </button>
              <button
                className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                onClick={handleSaveWithErrorHandling}
                disabled={saving}
              >
                {saving ? 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving')}
                  </span> 
                  : t('save_changes')
                }
              </button>
            </div>
            
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 rounded-full w-6 h-6 flex items-center justify-center"
              onClick={resetModals}
              disabled={saving}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Create Modal Popup */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[2000]">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-lg relative animate-fadeIn">
            <h2 className="text-base font-bold mb-6 flex items-center text-gray-800">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('new_achievement_title')}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <input
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent"
                    value={createTitle}
                    onChange={e => setCreateTitle(e.target.value)}
                    placeholder={t('enter_achievement_title')}
                  />
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('title_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <select
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent"
                    value={createConditionType}
                    onChange={e => setCreateConditionType(e.target.value as ConditionTypeEnum)}
                  >
                    {Object.values(ConditionTypeEnum).map((type) => (
                      <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('condition_type_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <textarea
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent resize-none"
                    value={createDescription}
                    onChange={e => setCreateDescription(e.target.value)}
                    placeholder={t('enter_achievement_description')}
                    rows={1}
                  />
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('description_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <div className="relative mb-3">
                  <input
                    type="number"
                    min={1}
                    className="w-full border-0 px-0 py-1 text-sm focus:ring-0 focus:outline-none bg-transparent"
                    value={createConditionValue}
                    onChange={e => setCreateConditionValue(Number(e.target.value))}
                    placeholder={t('enter_numeric_value')}
                  />
                  <label className="absolute -top-5 left-0 text-xs text-blue-500 font-medium tracking-wider">{t('value_label')}</label>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center mb-2">
                <div className="relative mr-3">
                  <label className="text-xs text-blue-500 font-medium tracking-wider mb-1 block">{t('icon_label')}</label>
                  {!previewImageCreate ? (
                    <div className="mt-1 flex items-center">
                      <label className="flex items-center justify-center w-20 h-20 border border-dashed border-gray-400 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <input 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCreateFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-1 w-20 h-20 relative">
                      <img 
                        src={previewImageCreate} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button 
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setPreviewImageCreate(null);
                          setCreateIconFile(null);
                        }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-xs text-gray-500 tracking-wider pl-2">
                  {t('square_image_recommended')}
                </div>
              </div>
            </div>
            
            {createValidationError && (
              <div className="mt-3 p-2 bg-red-50 text-red-500 text-xs rounded-md flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {createValidationError}
              </div>
            )}

            {networkError && (
              <div className="mt-3 p-2 bg-red-50 text-red-500 text-xs rounded-md flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {networkError}
              </div>
            )}
            
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="px-4 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                onClick={resetModals}
                disabled={createLoading}
              >
                {t('cancel')}
              </button>
              <button
                className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                onClick={handleCreateWithErrorHandling}
                disabled={createLoading}
              >
                {createLoading ? 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('creating')}
                  </span> 
                  : t('create_achievement_cta')
                }
              </button>
            </div>
            
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 rounded-full w-6 h-6 flex items-center justify-center"
              onClick={resetModals}
              disabled={createLoading}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsAdminPage; 