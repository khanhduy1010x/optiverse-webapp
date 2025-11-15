import React from 'react';
import { Achievement, LogicOperator } from '../../types/achievement/achievement.types';
import { useAchievementForm } from '../../hooks/achievement/useAchievementForm';
import Button from '../common/Button.component';
import RuleFormModal from './RuleFormModal.component';
import { AchievementFormData } from '../../types/achievement/request/achievement.request';
import AchievementEditor from './AchievementEditor.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface AchievementFormModalProps {
  isOpen: boolean;
  achievement: Achievement | null;
  onSubmit: (data: AchievementFormData) => void;
  onCancel: () => void;
  externalFieldErrors?: { [key: string]: string } | null;
}

const AchievementFormModal: React.FC<AchievementFormModalProps> = ({
  isOpen,
  achievement,
  onSubmit,
  onCancel,
  externalFieldErrors
}) => {
  const { t } = useAppTranslate('achievement');
  const {
    // Form data
    formData,

    // File handling
    selectedFile,
    previewUrl,
    fileError,

    // Rules
    showRuleForm,
    editingRuleIndex,

    // Validation
    hasError,
    getError,
    hasExternalError,
    getExternalError,

    // Event handlers
    handleInputChange,
    handleFileChange,
    handleBlur,
    handleSubmit,
    handleAddRule,
    handleEditRule,
    handleDeleteRule,
    handleRuleSubmit,
    handleRuleCancel,

    // Utilities
    removeFile
  } = useAchievementForm({
    initialAchievement: achievement,
    onSubmit,
    externalFieldErrors
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Achievement Form Modal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex justify-between items-center" style={{ background: '#22b4ca' }}>
            <h2 className="text-base font-bold text-white" style={{ color: '#fff' }}>
              {achievement ? t('edit_achievement') : t('create_new_achievement')}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form Content */}
          <div
            className="overflow-y-auto max-h-[calc(90vh-120px)]"
            style={{scrollbarWidth: 'none' }}><style>{`div::-webkit-scrollbar {display: none;}`}</style>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('title')} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${(hasError('title') || hasExternalError('title')) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder={t('enter_title')}
                />
                {(hasError('title') || hasExternalError('title')) && (
                  <p className="mt-1 text-sm text-red-600">{getExternalError('title') || getError('title')}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')} *
                </label>
                <AchievementEditor
                  value={formData.description || ''}
                  onChange={(value) => handleInputChange({ target: { name: 'description', value } } as any)}
                  onBlur={() => handleBlur('description')}
                  hasError={hasError('description')}
                  placeholder={t('enter_description')}
                />
                {hasError('description') && (
                  <p className="mt-1 text-sm text-red-600">{getError('description')}</p>
                )}
              </div>

              {/* Reward Field */}
              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reward')} *
                </label>
                <input
                  type="number"
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('reward')}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${hasError('reward') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder={t('enter_reward_points')}
                />
                {hasError('reward') && (
                  <p className="mt-1 text-sm text-red-600">{getError('reward')}</p>
                )}
              </div>

              {/* Logic Operator */}
              <div>
                <label htmlFor="logic_operator" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('logic_operator')} *
                </label>
                <select
                  id="logic_operator"
                  name="logic_operator"
                  value={formData.logic_operator}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('logic_operator')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${hasError('logic_operator') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value={LogicOperator.AND}>AND</option>
                  <option value={LogicOperator.OR}>OR</option>
                </select>
                {hasError('logic_operator') && (
                  <p className="mt-1 text-sm text-red-600">{getError('logic_operator')}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('achievement_image')}
                </label>
                <div className="space-y-4">
                  {!previewUrl && (
                    <>
                      <input
                        type="file"
                        id="file"
                        name="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                      {fileError && (
                        <p className="text-sm text-red-600 mt-2">{fileError}</p>
                      )}
                    </>
                  )}
                  {previewUrl && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Rules Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rules')} *
                  </label>
                  <Button
                    type="button"
                    title={t('add_rule')}
                    onClick={handleAddRule}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  />
                </div>

                {hasError('rules') && (
                  <p className="mb-4 text-sm text-red-600">{getError('rules')}</p>
                )}

                {(formData.rules?.length || 0) === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <p className="text-gray-500">{t('no_rules_added_yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.rules?.map((rule, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {rule.category} - {rule.field}
                          </p>
                          <p className="text-xs text-gray-600">
                            {rule.operator} {rule.value}
                            {rule.threshold && ` (threshold: ${rule.threshold})`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditRule(rule, index)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {t('edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  title={t('cancel')}
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                />
                <Button
                  type="submit"
                  title={achievement ? t('update_achievement') : t('create_achievement')}
                  style={{ backgroundColor: '#21b4ca', color: '#fff' }}
                  className="px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all"
                />

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Rule Form Modal */}
      {showRuleForm && (
        <RuleFormModal
          isOpen={showRuleForm}
          rule={typeof editingRuleIndex === 'number' && formData.rules ? formData.rules[editingRuleIndex] : undefined}
          onSubmit={handleRuleSubmit}
          onCancel={handleRuleCancel}
        />
      )}
    </>
  );
};

export default AchievementFormModal;