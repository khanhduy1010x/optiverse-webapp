import React, { useState } from 'react';
import { Rule } from '../../types/achievement/achievement.types';
import { useRuleForm } from '../../hooks/achievement/useRuleForm';
import { 
  CATEGORY_FIELDS,
  OPERATOR_LABELS,
  DATE_TOKENS
} from '../../types/achievement/achievement.types';
import Button from '../common/Button.component';

interface RuleFormModalProps {
  isOpen: boolean;
  rule?: Rule;
  onSubmit: (rule: Rule) => void;
  onCancel: () => void;
}

const RuleFormModal: React.FC<RuleFormModalProps> = ({
  isOpen,
  rule,
  onSubmit,
  onCancel
}) => {
  const {
    // Form data
    formData,
    setFormData,
    
    // Computed values
    selectedField,
    availableOperators,
    needsThreshold,
    
    // Validation
    hasError,
    getError,
    
    // Event handlers
    handleInputChange,
    handleBlur,
    handleSubmit
  } = useRuleForm({
    initialRule: rule,
    onSubmit
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
       <div
  className="px-6 py-4 flex justify-between items-center"
  style={{ backgroundColor: '#21b4ca' }}
>

          <h2 className="text-xl font-bold text-white">
            {rule ? 'Edit Rule' : 'Create New Rule'}
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
            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onBlur={() => handleBlur('category')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  hasError('category') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {Object.keys(CATEGORY_FIELDS).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {hasError('category') && (
                <p className="mt-1 text-sm text-red-600">{getError('category')}</p>
              )}
            </div>

            {/* Field Selection */}
            <div>
              <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-2">
                Field *
              </label>
              <select
                id="field"
                name="field"
                value={formData.field}
                onChange={handleInputChange}
                onBlur={() => handleBlur('field')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  hasError('field') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={!formData.category}
              >
                <option value="">Select a field</option>
                {CATEGORY_FIELDS[formData.category]?.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
              {hasError('field') && (
                <p className="mt-1 text-sm text-red-600">{getError('field')}</p>
              )}
            </div>

            
            {/* Value Field: chỉ hiển thị cho DATE và ENUM */}
            {(selectedField?.value_type === 'DATE' || selectedField?.value_type === 'ENUM') && (
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                {selectedField?.value_type === 'DATE' ? (
                  <div className="space-y-3">
                    {/* Dropdown: 1D / 7D / 30D / Range */}
                    <select
                      id="date-option"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        hasError('value') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={(formData.value && !formData.value.includes(' to ') && formData.value !== 'RANGE_MODE') ? formData.value : (formData.value && (formData.value.includes(' to ') || formData.value === 'RANGE_MODE') ? 'RANGE' : '')}
                      onChange={(e) => {
                        const opt = e.target.value;
                        if (opt === 'RANGE') {
                          // Khi chọn Range, set value thành 'RANGE_MODE' để phân biệt với preset
                          setFormData(prev => ({ ...prev, value: 'RANGE_MODE' }));
                        } else {
                          setFormData(prev => ({ ...prev, value: opt }));
                          handleBlur('value');
                        }
                      }}
                    >
                      <option value="">Select 1D/7D/30D or enter range: YYYY-MM-DD to YYYY-MM-DD</option>
                      {Array.from(DATE_TOKENS).map(token => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                      <option value="RANGE">Range (YYYY-MM-DD to YYYY-MM-DD)</option>
                    </select>

                    {/* Hiển input khi chọn Range */}
                    {(() => {
                      const currentValue = formData.value?.trim() || '';
                      const isPreset = Array.from(DATE_TOKENS).some(token => token === currentValue);
                      const isRange = currentValue.includes(' to ');
                      const isRangeMode = currentValue === 'RANGE_MODE';
                      const isRangeStart = currentValue.startsWith('RANGE_START:');
                      const isRangeEnd = currentValue.startsWith('RANGE_END:');
                      
                      // Parse start và end date từ các format khác nhau
                      let start = '', end = '';
                      if (isRange) {
                        const parts = currentValue.split(' to ');
                        start = parts[0]?.trim() || '';
                        end = parts[1]?.trim() || '';
                      } else if (isRangeStart) {
                        start = currentValue.replace('RANGE_START:', '');
                      } else if (isRangeEnd) {
                        end = currentValue.replace('RANGE_END:', '');
                      }
                      
                      // Chỉ hiển thị range input khi chọn RANGE option hoặc đã có range format
                      if (!isRangeMode && !isRange && !isRangeStart && !isRangeEnd) return null;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="date"
                              id="date-range-start"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                hasError('value') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Start date"
                              value={start}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                const currentEnd = end;
                                
                                if (newStart && currentEnd) {
                                  // Cả hai đều có giá trị
                                  setFormData(prev => ({ ...prev, value: `${newStart} to ${currentEnd}` }));
                                } else if (newStart) {
                                  // Chỉ có start date, lưu tạm thời
                                  setFormData(prev => ({ ...prev, value: `RANGE_START:${newStart}` }));
                                } else {
                                  // Xóa start date
                                  if (currentEnd) {
                                    setFormData(prev => ({ ...prev, value: `RANGE_END:${currentEnd}` }));
                                  } else {
                                    setFormData(prev => ({ ...prev, value: 'RANGE_MODE' }));
                                  }
                                }
                              }}
                              onBlur={() => handleBlur('value')}
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              id="date-range-end"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                                hasError('value') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="End date"
                              value={end}
                              onChange={(e) => {
                                const newEnd = e.target.value;
                                const currentStart = start;
                                
                                if (currentStart && newEnd) {
                                  // Cả hai đều có giá trị
                                  setFormData(prev => ({ ...prev, value: `${currentStart} to ${newEnd}` }));
                                } else if (newEnd) {
                                  // Chỉ có end date, lưu tạm thời
                                  setFormData(prev => ({ ...prev, value: `RANGE_END:${newEnd}` }));
                                } else {
                                  // Xóa end date
                                  if (currentStart) {
                                    setFormData(prev => ({ ...prev, value: `RANGE_START:${currentStart}` }));
                                  } else {
                                    setFormData(prev => ({ ...prev, value: 'RANGE_MODE' }));
                                  }
                                }
                              }}
                              onBlur={() => handleBlur('value')}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-gray-500">Select 1D/7D/30D or enter range: YYYY-MM-DD to YYYY-MM-DD</p>
                    {hasError('value') && (
                      <p className="mt-1 text-sm text-red-600">{getError('value')}</p>
                    )}
                  </div>
                ) : (
                  // ENUM: chọn từ options
                  <select
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('value')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      hasError('value') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={!selectedField}
                  >
                    <option value="">Select an option</option>
                    {selectedField?.options?.map((opt: { value: any; label: string }) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Threshold Field (conditional) */}
            {needsThreshold && selectedField?.value_type !== 'DATE' && (
              <div>
                <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold *
                </label>
                <input
                  type="number"
                  id="threshold"
                  name="threshold"
                  value={formData.threshold || ''}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('threshold')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    hasError('threshold') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter threshold value"
                />
                {hasError('threshold') && (
                  <p className="mt-1 text-sm text-red-600">{getError('threshold')}</p>
                )}
              </div>
            )}

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
  title={rule ? 'Update Rule' : 'Create Rule'}
  style={{ backgroundColor: '#21b4ca', color: '#fff' }}
  className="px-6 py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-all"
/>


            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RuleFormModal;