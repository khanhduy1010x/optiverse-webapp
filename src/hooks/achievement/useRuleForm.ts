import { useState, useEffect, useCallback } from 'react';
import { 
  Rule, 
  RuleCategory, 
  ValueType, 
  Operator,
  CATEGORY_FIELDS,
  VALUE_TYPE_OPERATORS
} from '../../types/achievement/achievement.types';
import { useFormValidation, ValidationRules } from './useFormValidation';
import { RuleValidationUtils } from '../../utils/achievement/validation.utils';

interface UseRuleFormProps {
  initialRule?: Rule;
  onSubmit: (rule: Rule) => void;
}

interface UseRuleFormReturn {
  // Form data
  formData: Rule;
  setFormData: React.Dispatch<React.SetStateAction<Rule>>;
  
  // Computed values
  selectedField: any;
  availableOperators: Operator[];
  needsThreshold: boolean;
  
  // Validation
  hasError: (field: string) => boolean;
  getError: (field: string) => string | null;
  
  // Event handlers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (fieldName: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const useRuleForm = ({ 
  initialRule, 
  onSubmit 
}: UseRuleFormProps): UseRuleFormReturn => {
  // Form state
  const DEFAULT_RULE: Rule = {
    category: RuleCategory.TASK,
    field: '',
    value_type: ValueType.STRING,
    operator: Operator.GTE,
    value: '',
    threshold: undefined
  };

  const [formData, setFormData] = useState<Rule>({
    ...DEFAULT_RULE
  });

  // Validation rules
  const validationRules: ValidationRules = {
    category: {
      required: true,
      custom: (value) => RuleValidationUtils.validateCategory(value as string)
    },
    field: {
      required: true,
      custom: (value) => RuleValidationUtils.validateField(value as string)
    },
    operator: {
      required: true,
      custom: (value) => RuleValidationUtils.validateOperator(value as string)
    },
    value: {
      custom: (value) => {
        const selectedField = CATEGORY_FIELDS[formData.category]?.find(f => f.name === formData.field);
        const vt = selectedField?.value_type || ValueType.STRING;
        // Chỉ yêu cầu value khi là DATE hoặc ENUM
        if (vt !== ValueType.DATE && vt !== ValueType.ENUM && (!value || String(value).trim() === '')) {
          // với NUMBER/STRING/BOOLEAN: có thể bỏ trống value, chỉ Threshold dùng
          return null;
        }
        return RuleValidationUtils.validateValue(
          value as string,
          vt
        );
      }
    },
    threshold: {
      custom: (threshold) => {
        const selectedField = CATEGORY_FIELDS[formData.category]?.find(f => f.name === formData.field);
        // STRING, NUMBER, và ENUM cần threshold
        const needsThreshold = selectedField ? (selectedField.value_type === ValueType.STRING || selectedField.value_type === ValueType.NUMBER || selectedField.value_type === ValueType.ENUM) : false;
        return RuleValidationUtils.validateThreshold(threshold as number, needsThreshold);
      }
    }
  };

  const { validateForm, validateSingleField, setFieldTouched, hasError, getError } = useFormValidation(validationRules);

  // Initialize form data
  useEffect(() => {
    if (initialRule) {
      // Edit mode: nạp rule hiện có
      setFormData({
        category: initialRule.category ?? RuleCategory.TASK,
        field: initialRule.field ?? '',
        value_type: initialRule.value_type ?? ValueType.STRING,
        operator: initialRule.operator ?? Operator.EQ,
        value: initialRule.value ?? '',
        threshold: initialRule.threshold,
      });
    } else {
      // Create mode: reset về mặc định để không dính dữ liệu edit
      setFormData({ ...DEFAULT_RULE });
    }
  }, [initialRule]);

  // Computed values
  const selectedField = CATEGORY_FIELDS[formData.category]?.find(f => f.name === formData.field);
  const availableOperators = selectedField ? VALUE_TYPE_OPERATORS[selectedField.value_type] : [];
  // STRING, NUMBER, và ENUM cần threshold
  const needsThreshold = selectedField ? (selectedField.value_type === ValueType.STRING || selectedField.value_type === ValueType.NUMBER || selectedField.value_type === ValueType.ENUM) : false;

  // Event handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === 'threshold') {
      processedValue = value === '' ? undefined : Number(value);
    }
    
    // Reset dependent fields when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        field: '', // Reset field when category changes
        operator: Operator.GTE, // Always use GTE operator
        value: '', // Reset value
        threshold: undefined // Reset threshold
      }));
    } else if (name === 'field') {
      // Reset operator and value when field changes
      const newSelectedField = CATEGORY_FIELDS[formData.category]?.find(f => f.name === value);
      const newAvailableOperators = newSelectedField ? VALUE_TYPE_OPERATORS[newSelectedField.value_type] : [];
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        value_type: newSelectedField?.value_type || ValueType.STRING,
        operator: Operator.GTE, // Always use GTE operator
        value: '', // Reset value
        threshold: undefined // Reset threshold
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Validate field on change
    setFieldTouched(name);
    validateSingleField(name, processedValue);
  }, [formData.category, setFieldTouched, validateSingleField]);

  const handleBlur = useCallback((fieldName: string) => {
    setFieldTouched(fieldName);
    validateSingleField(fieldName, formData[fieldName as keyof Rule]);
  }, [formData, setFieldTouched, validateSingleField]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize: nếu là DATE thì không dùng threshold
    const selectedFieldLocal = CATEGORY_FIELDS[formData.category]?.find(f => f.name === formData.field);
    const vt = selectedFieldLocal?.value_type || ValueType.STRING;
    const submitData: Rule = vt === ValueType.DATE
      ? { ...formData, threshold: undefined }
      : formData;

    // Validate entire form với dữ liệu đã được làm sạch
    const isValid = validateForm(submitData);
    if (!isValid) {
      return;
    }

    onSubmit(submitData);
  }, [formData, validateForm, onSubmit]);

  return {
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
  };
};