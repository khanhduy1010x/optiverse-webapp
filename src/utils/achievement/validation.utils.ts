import { Achievement, Rule, ValueType, DATE_TOKENS } from '../../types/achievement/achievement.types';

export interface ValidationError {
  field: string;
  message: string;
}

export class AchievementValidationUtils {
  /**
   * Validate achievement title
   */
  static validateTitle(title: string): string | null {
    if (!title || title.trim() === '') {
      return 'Title is required';
    }
    
    if (title.trim().length < 3) {
      return 'Title must be at least 3 characters long';
    }
    
    if (title.length > 100) {
      return 'Title must not exceed 100 characters';
    }
    
    return null;
  }

  /**
   * Validate achievement description
   */
  static validateDescription(description?: string): string | null {
    if (description && description.length > 500) {
      return 'Description must not exceed 500 characters';
    }
    
    return null;
  }

  /**
   * Validate reward points
   */
  static validateReward(reward?: string | number): string | null {
    if (reward !== undefined && reward !== null && reward !== '') {
      const numValue = Number(reward);
      if (isNaN(numValue) || numValue < 0) {
        return 'Reward must be a positive number';
      }
    }
    
    return null;
  }

  /**
   * Validate achievement rules
   */
  static validateRules(rules?: Rule[]): string | null {
    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return 'At least one rule is required';
    }
    
    return null;
  }

  /**
   * Validate file upload
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select an image file' };
    }

    return { isValid: true };
  }

  /**
   * Validate entire achievement object
   */
  static validateAchievement(achievement: Partial<Achievement>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate title
    const titleError = this.validateTitle(achievement.title || '');
    if (titleError) {
      errors.push({ field: 'title', message: titleError });
    }

    // Validate description
    const descriptionError = this.validateDescription(achievement.description);
    if (descriptionError) {
      errors.push({ field: 'description', message: descriptionError });
    }

    // Validate reward
    const rewardError = this.validateReward(achievement.reward);
    if (rewardError) {
      errors.push({ field: 'reward', message: rewardError });
    }

    // Validate rules
    const rulesError = this.validateRules(achievement.rules);
    if (rulesError) {
      errors.push({ field: 'rules', message: rulesError });
    }

    return errors;
  }
}

export class RuleValidationUtils {
  /**
   * Validate rule category
   */
  static validateCategory(category: string): string | null {
    if (!category || category.trim() === '') {
      return 'Category is required';
    }
    
    return null;
  }

  /**
   * Validate rule field
   */
  static validateField(field: string): string | null {
    if (!field || field.trim() === '') {
      return 'Field is required';
    }
    
    return null;
  }

  /**
   * Validate rule operator
   */
  static validateOperator(operator: string): string | null {
    if (!operator || operator.trim() === '') {
      return 'Operator is required';
    }
    
    return null;
  }

  /**
   * Validate rule value based on value type
   */
  static validateValue(value: string, valueType: ValueType): string | null {
    // Giá trị rỗng: chỉ bắt buộc với ENUM, DATE không bắt buộc
    const isEmpty = !value || value.trim() === '';
    if (isEmpty && valueType === ValueType.ENUM) {
      return 'Value is required';
    }
    
    // Nếu DATE mà rỗng thì cho phép (optional)
    if (isEmpty) {
      return null;
    }

    switch (valueType) {
      case ValueType.DATE:
        // Accept presets like 1D, 7D, 30D
        if ((DATE_TOKENS as readonly string[]).includes(value)) {
          break;
        }

        // Accept temporary range states
        if (value === 'RANGE_MODE' || value.startsWith('RANGE_START:') || value.startsWith('RANGE_END:')) {
          return 'Please complete the date range selection';
        }

        // Accept range: YYYY-MM-DD to YYYY-MM-DD
        const rangeRegex = /^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/;
        const singleDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (rangeRegex.test(value)) {
          const [startStr, endStr] = value.split(' to ');
          if (!singleDateRegex.test(startStr) || !singleDateRegex.test(endStr)) {
            return 'Date must be in YYYY-MM-DD format';
          }
          // Ensure start <= end
          const start = new Date(startStr);
          const end = new Date(endStr);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 'Invalid date range';
          }
          if (start > end) {
            return 'Start date must be before or equal to end date';
          }
          break;
        }

        // Otherwise accept single date
        if (!singleDateRegex.test(value)) {
          return 'Date must be in YYYY-MM-DD format';
        }
        break;
      
      case ValueType.NUMBER:
        if (isNaN(Number(value))) {
          return 'Value must be a number';
        }
        break;
      
      case ValueType.ENUM:
        // Nếu không rỗng thì chấp nhận bất kỳ chuỗi, validation chọn option ở UI
        break;
      default:
        // STRING/BOOLEAN: nếu rỗng thì đã pass ở trên; nếu có giá trị thì không ràng buộc thêm
        break;
    }

    return null;
  }

  /**
   * Validate rule threshold
   */
  static validateThreshold(threshold: number | undefined, requiresThreshold: boolean): string | null {
    if (requiresThreshold) {
      if (threshold === undefined || threshold === null) {
        return 'Threshold is required for this field';
      }
      
      const numThreshold = Number(threshold);
      if (isNaN(numThreshold)) {
        return 'Threshold must be a number';
      }
      
      if (numThreshold < 0) {
        return 'Threshold must be a positive number';
      }
    }

    if (threshold !== undefined && threshold !== null) {
      const numThreshold = Number(threshold);
      if (isNaN(numThreshold)) {
        return 'Threshold must be a number';
      }
      
      if (numThreshold < 0) {
        return 'Threshold must be a positive number';
      }
    }

    return null;
  }

  /**
   * Validate entire rule object
   */
  static validateRule(rule: Partial<Rule>, valueType: ValueType, requiresThreshold: boolean): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate category
    const categoryError = this.validateCategory(rule.category || '');
    if (categoryError) {
      errors.push({ field: 'category', message: categoryError });
    }

    // Validate field
    const fieldError = this.validateField(rule.field || '');
    if (fieldError) {
      errors.push({ field: 'field', message: fieldError });
    }

    // Validate operator
    const operatorError = this.validateOperator(rule.operator || '');
    if (operatorError) {
      errors.push({ field: 'operator', message: operatorError });
    }

    // Validate value
    const valueError = this.validateValue(rule.value || '', valueType);
    if (valueError) {
      errors.push({ field: 'value', message: valueError });
    }

    // Validate threshold
    const thresholdError = this.validateThreshold(rule.threshold, requiresThreshold);
    if (thresholdError) {
      errors.push({ field: 'threshold', message: thresholdError });
    }

    return errors;
  }
}