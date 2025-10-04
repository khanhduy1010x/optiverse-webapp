import React from 'react';
import { Achievement, LogicOperator } from '../../types/achievement/achievement.types';
import { useAchievementForm } from '../../hooks/achievement/useAchievementForm';
import Button from '../common/Button.component';
import RuleFormModal from './RuleFormModal.component';
import { AchievementFormData } from '../../types/achievement/request/achievement.request';

interface AchievementFormModalProps {
  isOpen: boolean;
  achievement: Achievement | null;
  onSubmit: (data: AchievementFormData) => void;
  onCancel: () => void;
}

const AchievementFormModal: React.FC<AchievementFormModalProps> = ({
  isOpen,
  achievement,
  onSubmit,
  onCancel
}) => {
  const {
    // Form data
    formData,
    
    // File handling
    selectedFile,
    previewUrl,
    
    // Rules
    showRuleForm,
    editingRuleIndex,
    
    // Validation
    hasError,
    getError,
    
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
    onSubmit
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Achievement Form Modal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {achievement ? 'Edit Achievement' : 'Create New Achievement'}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('title')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    hasError('title') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter achievement title"
                />
                {hasError('title') && (
                  <p className="mt-1 text-sm text-red-600">{getError('title')}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none ${
                    hasError('description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter achievement description"
                />
                {hasError('description') && (
                  <p className="mt-1 text-sm text-red-600">{getError('description')}</p>
                )}
              </div>

              {/* Reward Field */}
              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
                  Reward *
                </label>
                <input
                  type="number"
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('reward')}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    hasError('reward') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter reward points"
                />
                {hasError('reward') && (
                  <p className="mt-1 text-sm text-red-600">{getError('reward')}</p>
                )}
              </div>

              {/* Logic Operator */}
              <div>
                <label htmlFor="logic_operator" className="block text-sm font-medium text-gray-700 mb-2">
                  Logic Operator *
                </label>
                <select
                  id="logic_operator"
                  name="logic_operator"
                  value={formData.logic_operator}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('logic_operator')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    hasError('logic_operator') ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                  Achievement Image
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {hasError('file') && (
                    <p className="text-sm text-red-600">{getError('file')}</p>
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
                    Rules *
                  </label>
                  <Button
                    type="button"
                    title="Add Rule"
                    onClick={handleAddRule}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  />
                </div>
                
                {hasError('rules') && (
                  <p className="mb-4 text-sm text-red-600">{getError('rules')}</p>
                )}

                {(formData.rules?.length || 0) === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <p className="text-gray-500">No rules added yet. Click "Add Rule" to create your first rule.</p>
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
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
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
                  title="Cancel"
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                />
                <Button
                  type="submit"
                  title={achievement ? 'Update Achievement' : 'Create Achievement'}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm"
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