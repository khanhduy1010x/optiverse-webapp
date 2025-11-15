import { useState, useEffect, useCallback } from 'react';
import { Achievement, Rule, LogicOperator } from '../../types/achievement/achievement.types';
import { useFormValidation, ValidationRules } from './useFormValidation';
import { AchievementValidationUtils } from '../../utils/achievement/validation.utils';
import { FileUploadUtils } from '../../utils/achievement/file.utils';
import { AchievementFormData } from '../../types/achievement/request/achievement.request';

interface UseAchievementFormProps {
  initialAchievement: Achievement | null;
  onSubmit: (achievement: AchievementFormData) => void;
  externalFieldErrors?: { [key: string]: string } | null;
}

interface UseAchievementFormReturn {
  // Form data
  formData: AchievementFormData;
  setFormData: React.Dispatch<React.SetStateAction<AchievementFormData>>;

  // File handling
  selectedFile: File | null;
  previewUrl: string;
  fileError: string;

  // Rule management
  showRuleForm: boolean;
  editingRule: Rule | undefined;
  editingRuleIndex: number | undefined;

  // Validation
  hasError: (field: string) => boolean;
  getError: (field: string) => string | null;
  hasExternalError: (field: string) => boolean;
  getExternalError: (field: string) => string | null;
  
  // Event handlers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (fieldName: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;

  // Rule management handlers
  handleAddRule: () => void;
  handleEditRule: (rule: Rule, index: number) => void;
  handleRuleSubmit: (rule: Rule) => void;
  handleDeleteRule: (index: number) => void;
  handleRuleCancel: () => void;

  // File utilities
  removeFile: () => void;
}

export const useAchievementForm = ({ 
  initialAchievement, 
  onSubmit,
  externalFieldErrors
}: UseAchievementFormProps): UseAchievementFormReturn => {
  // Form state
  const DEFAULT_FORM_DATA: AchievementFormData = {
    title: '',
    description: '',
    icon_url: '',
    rules: [],
    logic_operator: LogicOperator.AND,
    reward: '',
    icon_file: undefined,
  };

  const [formData, setFormData] = useState<AchievementFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    logic_operator: LogicOperator.AND, // Đảm bảo logic_operator luôn có giá trị mặc định
  }));

  // File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  // Rule form state
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | undefined>();
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | undefined>();

  // Validation rules
  const validationRules: ValidationRules = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
      custom: (value) => AchievementValidationUtils.validateTitle(value as string)
    },
    description: {
      maxLength: 500,
      custom: (value) => AchievementValidationUtils.validateDescription(value as string)
    },
    reward: {
      custom: (value) => AchievementValidationUtils.validateReward(value)
    },
    rules: {
      custom: (rules) => AchievementValidationUtils.validateRules(rules as Rule[])
    }
  };

  const { validateForm, validateSingleField, setFieldTouched, hasError, getError } = useFormValidation(validationRules);

  // Helper functions for external field errors
  const hasExternalError = useCallback((field: string): boolean => {
    return !!(externalFieldErrors && externalFieldErrors[field]);
  }, [externalFieldErrors]);

  const getExternalError = useCallback((field: string): string | null => {
    return externalFieldErrors?.[field] || null;
  }, [externalFieldErrors]);

  // Initialize form data
  useEffect(() => {
    console.log('=== DEBUG FORM INITIALIZATION ===');
    console.log('initialAchievement:', initialAchievement);
    
    if (initialAchievement) {
      console.log('Logic operator from API:', initialAchievement.logic_operator);
      console.log('Logic operator type:', typeof initialAchievement.logic_operator);
      
      // Khi edit: nạp dữ liệu vào form
      const newFormData = {
        title: initialAchievement.title ?? '',
        description: initialAchievement.description ?? '',
        icon_url: initialAchievement.icon_url ?? '',
        rules: initialAchievement.rules ?? [],
        logic_operator: initialAchievement.logic_operator ?? LogicOperator.AND, // Đảm bảo có fallback
        reward: (initialAchievement as any).reward ?? '',
        icon_file: undefined,
      };
      
      console.log('New form data:', newFormData);
      console.log('Form data logic_operator:', newFormData.logic_operator);
      
      setFormData(newFormData);
      setSelectedFile(null);
      setPreviewUrl(initialAchievement.icon_url || '');
    } else {
      console.log('Creating new achievement - using default data');
      // Khi create: reset sạch dữ liệu tránh dính từ edit
      setFormData({ 
        ...DEFAULT_FORM_DATA,
        logic_operator: LogicOperator.AND // Đảm bảo logic_operator có giá trị mặc định
      });
      setSelectedFile(null);
      setPreviewUrl('');
    }
  }, [initialAchievement]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        FileUploadUtils.cleanupPreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  // Event handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log('=== DEBUG INPUT CHANGE ===');
    console.log('Field name:', name);
    console.log('Field value:', value);
    console.log('Field type:', typeof value);
    
    // Giữ reward dạng string để tương thích backend
    const processedValue = value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue
      };
      
      if (name === 'logic_operator') {
        console.log('Logic operator changed to:', processedValue);
        console.log('New form data:', newData);
      }
      
      return newData;
       return newData;
    });

    // Validate field on change
    setFieldTouched(name);
    validateSingleField(name, processedValue);
  }, [setFieldTouched, validateSingleField]);

  const handleBlur = useCallback((fieldName: string) => {
    setFieldTouched(fieldName);
    validateSingleField(fieldName, formData[fieldName as keyof AchievementFormData]);
  }, [formData, setFieldTouched, validateSingleField]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = FileUploadUtils.validateFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Invalid file');
      setSelectedFile(null);
      setPreviewUrl('');
      setFormData(prev => ({
        ...prev,
        icon_file: undefined
      }));
      return;
    }

    setFileError('');
    setSelectedFile(file);

    // Cleanup previous preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      FileUploadUtils.cleanupPreviewUrl(previewUrl);
    }

    // Create new preview URL
    const url = FileUploadUtils.createPreviewUrl(file);
    setPreviewUrl(url);

    // Gán file vào formData và clear icon_url nếu có
    setFormData(prev => ({
      ...prev,
      icon_file: file,
      icon_url: ''
    }));
  }, [previewUrl]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Block submit if file error
    if (fileError) {
      return;
    }

    // Validate entire form
    const isValid = validateForm(formData);

    if (!isValid) {
      return;
    }

    // Dữ liệu submit đã có icon_file nếu có chọn file
    onSubmit(formData);
  }, [formData, validateForm, onSubmit, fileError]);

  // Rule management handlers
  const handleAddRule = useCallback(() => {
    setEditingRule(undefined);
    setEditingRuleIndex(undefined);
    setShowRuleForm(true);
  }, []);

  const handleEditRule = useCallback((rule: Rule, index: number) => {
    setEditingRule(rule);
    setEditingRuleIndex(index);
    setShowRuleForm(true);
  }, []);

  const handleRuleSubmit = useCallback((rule: Rule) => {
    const newRules = [...(formData.rules || [])];
    
    if (editingRuleIndex !== undefined && editingRuleIndex !== null) {
      newRules[editingRuleIndex] = rule;
    } else {
      newRules.push(rule);
    }
    
    setFormData(prev => ({
      ...prev,
      rules: newRules
    }));

    // Validate rules field
    setFieldTouched('rules');
    validateSingleField('rules', newRules);
    
    setShowRuleForm(false);
    setEditingRule(undefined);
    setEditingRuleIndex(undefined);
  }, [formData.rules, editingRuleIndex, setFieldTouched, validateSingleField]);

  const handleDeleteRule = useCallback((index: number) => {
    const newRules = formData.rules?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({
      ...prev,
      rules: newRules
    }));

    // Validate rules field
    setFieldTouched('rules');
    validateSingleField('rules', newRules);
  }, [formData.rules, setFieldTouched, validateSingleField]);

  const handleRuleCancel = useCallback(() => {
    setShowRuleForm(false);
    setEditingRule(undefined);
    setEditingRuleIndex(undefined);
  }, []);

  // File utilities
  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setFileError('');

    // Cleanup preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      FileUploadUtils.cleanupPreviewUrl(previewUrl);
    }

    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      icon_file: undefined
    }));
  }, [previewUrl]);

  return {
    // Form data
    formData,
    setFormData,

    // File handling
    selectedFile,
    previewUrl,
    fileError,

    // Rule management
    showRuleForm,
    editingRule,
    editingRuleIndex,

    // Validation
    hasError,
    getError,
    hasExternalError,
    getExternalError,

    // Event handlers
    handleInputChange,
    handleBlur,
    handleFileChange,
    handleSubmit,

    // Rule management handlers
    handleAddRule,
    handleEditRule,
    handleRuleSubmit,
    handleDeleteRule,
    handleRuleCancel,

    // File utilities
    removeFile
  };
};