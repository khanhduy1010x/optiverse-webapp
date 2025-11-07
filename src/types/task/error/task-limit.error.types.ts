/**
 * Task Limit Error Types
 * Định nghĩa các loại lỗi liên quan đến giới hạn tạo task
 */

export interface TaskLimitErrorDetails {
  currentLevel: string;
  currentLimit: number;
  tasksRemaining: number;
  tasksCreatedToday: number;
  resetTime: string;
}

export interface UpgradeSuggestion {
  suggestedLevel: string;
  suggestedLimit: number | string;
  limitIncrease: number | string;
  benefits: string[];
}

export interface TaskLimitExceededError {
  code: number;
  message: string;
  error: 'TASK_LIMIT_EXCEEDED';
  details: TaskLimitErrorDetails;
  upgrade: UpgradeSuggestion;
}

export interface TaskApiError {
  message?: string;
  error?: string;
  code?: number;
  details?: TaskLimitErrorDetails;
  upgrade?: UpgradeSuggestion;
  response?: {
    data?: TaskLimitExceededError;
    status?: number;
  };
}

/**
 * Type guard để check xem có phải TASK_LIMIT_EXCEEDED error không
 */
export function isTaskLimitExceededError(error: any): error is TaskLimitExceededError {
  // Check if error field is TASK_LIMIT_EXCEEDED
  const hasTaskLimitError = error?.error === 'TASK_LIMIT_EXCEEDED';
  
  // Should have either code or statusCode
  const hasValidCode = error?.code === 400 || error?.statusCode === 400;
  
  // Should have details and upgrade
  const hasDetails = error?.details && typeof error.details === 'object';
  const hasUpgrade = error?.upgrade && typeof error.upgrade === 'object';
  
  return hasTaskLimitError && hasValidCode && hasDetails && hasUpgrade;
}

/**
 * Type guard để check xem API error có chứa task limit info không
 */
export function hasTaskLimitExceededInfo(error: any): boolean {
  // Check nested response data (từ axios error)
  if (error?.response?.data) {
    return isTaskLimitExceededError(error.response.data);
  }
  // Check direct error object
  return isTaskLimitExceededError(error);
}

/**
 * Extract task limit error từ API response
 */
export function extractTaskLimitError(error: any): TaskLimitExceededError | null {
  console.log('[extractTaskLimitError] Input error:', {
    error_field: error?.error,
    code: error?.code,
    statusCode: error?.statusCode,
    response_status: error?.response?.status,
    response_data: error?.response?.data,
  });
  
  // Try to get the actual error data from various possible locations
  let errorData = null;
  
  // Check nested dalam response.data (axios error structure)
  if (error?.response?.data?.error === 'TASK_LIMIT_EXCEEDED') {
    console.log('[extractTaskLimitError] Found in response.data');
    errorData = error.response.data;
  }
  // Check direct error object (might be extracted already)
  else if (error?.error === 'TASK_LIMIT_EXCEEDED') {
    console.log('[extractTaskLimitError] Found as direct error object');
    errorData = error;
  }
  // Fallback: check if whole error object matches
  else if (error?.details && error?.upgrade && error?.message && error?.error === 'TASK_LIMIT_EXCEEDED') {
    console.log('[extractTaskLimitError] Found as complete error object');
    errorData = error;
  }
  
  // Validate using type guard
  if (errorData && isTaskLimitExceededError(errorData)) {
    console.log('[extractTaskLimitError] Successfully extracted task limit error');
    return errorData;
  }
  
  console.log('[extractTaskLimitError] Not a task limit error');
  return null;
}
