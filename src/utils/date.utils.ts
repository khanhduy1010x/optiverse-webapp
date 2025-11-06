export const formatDateTime = (isoString: string): string => {
  if (!isoString || isNaN(Date.parse(isoString))) {
    return '';
  }
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date).replace(',', '');
};

export const formatDateTimeShort = (isoString: string): string => {
  if (!isoString || isNaN(Date.parse(isoString))) {
    return '';
  }
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date).replace(',', '');
};

export const formatDateTimeFull = (isoString: string): string => {
  if (!isoString || isNaN(Date.parse(isoString))) {
    return '';
  }
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(date);
};

// Consistent date time format for the entire application
export const formatConsistentDateTime = (isoString: string | Date): string => {
  if (!isoString) {
    return '';
  }
  
  const date = isoString instanceof Date ? isoString : new Date(isoString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // Lấy giờ phút từ Date object local (đã convert sang timezone người dùng)
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  // Format ngày tháng
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Kết hợp ngày tháng và giờ phút từ local time
  return `${formatter.format(date)} ${hour}:${minute}`;
};

// Convert local datetime-local input value to ISO string with proper timezone handling
export const localDateTimeToISO = (dateTimeValue: string): string => {
  if (!dateTimeValue) return '';
  
  try {
    // Parse the local date string (format: YYYY-MM-DDThh:mm)
    // For datetime-local inputs, the browser uses local time without timezone info
    const [datePart, timePart] = dateTimeValue.split('T');
    if (!datePart || !timePart) {
      console.warn('Invalid date format in localDateTimeToISO:', dateTimeValue);
      return '';
    }
    
    // Create date object in local timezone
    // Add seconds to ensure proper parsing
    const localDate = new Date(`${datePart}T${timePart}:00`);
    
    // Check if the date is valid
    if (isNaN(localDate.getTime())) {
      console.warn('Invalid date provided to localDateTimeToISO:', dateTimeValue);
      return '';
    }
    
    // Get the timezone offset in minutes
    const timezoneOffset = localDate.getTimezoneOffset();
    
    // Adjust the date to UTC by adding the timezone offset
    const utcDate = new Date(localDate.getTime() + (timezoneOffset * 60 * 1000));
    
    // Log for debugging
    console.log('Date conversion in localDateTimeToISO:', {
      input: dateTimeValue,
      localDate: localDate.toString(),
      timezoneOffset,
      utcDate: utcDate.toISOString(),
      finalISO: utcDate.toISOString()
    });
    
    // Return ISO string in UTC
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting date in localDateTimeToISO:', error);
    return '';
  }
}

// Convert ISO string to local datetime-local input value
export const isoToLocalDateTime = (isoString: string | Date): string => {
  if (!isoString) return '';
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error in isoToLocalDateTime:', error);
    return '';
  }
}

export function formatElapsedTime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  if (days) return `${days} day${days > 1 ? 's' : ''}`;

  if (hours) return `${hours} hour${hours > 1 ? 's' : ''}`;

  if (minutes) return `${minutes} minute${minutes > 1 ? 's' : ''}`;

  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format elapsed time for i18n support
 * Returns an object with value and unit key for translation
 */
export function getElapsedTimeForI18n(seconds: number): { value: number; unit: string; key: string } {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  if (days) return { value: days, unit: days > 1 ? 'days' : 'day', key: 'flashcard:' + (days > 1 ? 'days' : 'day') };
  if (hours) return { value: hours, unit: hours > 1 ? 'hours' : 'hour', key: 'flashcard:' + (hours > 1 ? 'hours' : 'hour') };
  if (minutes) return { value: minutes, unit: minutes > 1 ? 'minutes' : 'minute', key: 'flashcard:' + (minutes > 1 ? 'minutes' : 'minute') };
  
  return { value: 0, unit: 'just_now', key: 'flashcard:just_now' };
}


/**
 * Tính thời gian còn lại đến deadline và trả về chuỗi hiển thị đếm ngược
 * @param endTimeIso Thời gian kết thúc dưới dạng chuỗi ISO hoặc đối tượng Date
 * @returns Chuỗi hiển thị thời gian còn lại, ví dụ: "2 days left", "5 hours left", "30 minutes left"
 */
export function getCountdownString(endTimeIso: string | Date): string {
  if (!endTimeIso) {
    console.log('getCountdownString: No end time provided');
    return '';
  }
  
  let endTime: Date;
  
  // Convert to Date object
  if (typeof endTimeIso === 'string') {
    endTime = new Date(endTimeIso);
  } else {
    endTime = endTimeIso;
  }
  
  // Check if date is valid
  if (isNaN(endTime.getTime())) {
    console.warn('getCountdownString: Invalid date:', endTimeIso);
    return '';
  }
  
  const now = new Date();
  
  // Log for debugging
  console.log('getCountdownString debug:', {
    endTimeIso,
    endTimeFormatted: endTime.toISOString(),
    nowFormatted: now.toISOString(),
    timeLeftMs: endTime.getTime() - now.getTime()
  });
  
  // Calculate time left in milliseconds
  const timeLeft = endTime.getTime() - now.getTime();
  
  // If already passed deadline, return "Overdue" instead of empty string
  if (timeLeft <= 0) {
    console.log('getCountdownString: Time already passed, returning Overdue');
    return 'Overdue';
  }
  
  // Convert to seconds
  const secondsLeft = Math.floor(timeLeft / 1000);
  
  // Calculate time units
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = Math.floor(secondsLeft % 60);
  
  // For debugging
  console.log('getCountdownString time units:', { days, hours, minutes, seconds });
  
  // Return the largest time unit with proper formatting
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''} left`;
  } else {
    return 'Less than a second left';
  }
}

/**
 * Kiểm tra xem task đã quá 3/4 thời gian từ start đến end chưa, và vẫn đang ở trạng thái pending
 * @param taskOrStartTime Task object hoặc thời gian bắt đầu task
 * @param endTimeIso Thời gian kết thúc task (nếu tham số đầu không phải Task object)
 * @param status Trạng thái hiện tại của task (nếu tham số đầu không phải Task object)
 * @returns true nếu task đã qua 3/4 thời gian và vẫn pending, false trong các trường hợp khác
 */
export function isTaskNearDue(taskOrStartTime: any, endTimeIso?: string | Date, status?: string): boolean {
  // Kiểm tra nếu tham số đầu tiên là Task object
  if (taskOrStartTime && typeof taskOrStartTime === 'object' && !Array.isArray(taskOrStartTime) && !(taskOrStartTime instanceof Date)) {
    const task = taskOrStartTime;
    return isTaskNearDue(task.start_time, task.end_time, task.status);
  }

  // Xử lý như trước đây nếu không phải Task object
  const startTimeIso = taskOrStartTime;
  if (!startTimeIso || !endTimeIso || status !== 'pending') return false;
  
  // Chuyển đổi sang Date
  const startTime = startTimeIso instanceof Date ? startTimeIso : new Date(startTimeIso);
  const endTime = endTimeIso instanceof Date ? endTimeIso : new Date(endTimeIso);
  const now = new Date();
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return false;
  
  // Tính toán tổng thời gian của task
  const totalDuration = endTime.getTime() - startTime.getTime();
  if (totalDuration <= 0) return false; // Đảm bảo thời gian hợp lệ
  
  // Tính thời gian đã trôi qua
  const elapsedTime = now.getTime() - startTime.getTime();
  if (elapsedTime < 0) return false; // Task chưa bắt đầu
  
  // Kiểm tra nếu đã qua 3/4 thời gian
  return elapsedTime >= (totalDuration * 0.75) && elapsedTime < totalDuration;
}

/**
 * Kiểm tra xem task đã quá hạn chưa
 * @param taskOrEndTime Task object hoặc thời gian kết thúc task
 * @param status Trạng thái hiện tại của task (nếu tham số đầu không phải Task object)
 * @returns true nếu task đã quá hạn và vẫn chưa completed, false trong các trường hợp khác
 */
export function isTaskOverdue(taskOrEndTime: any, status?: string): boolean {
  // Kiểm tra nếu tham số đầu tiên là Task object
  if (taskOrEndTime && typeof taskOrEndTime === 'object' && !Array.isArray(taskOrEndTime) && !(taskOrEndTime instanceof Date)) {
    const task = taskOrEndTime;
    return isTaskOverdue(task.end_time, task.status);
  }

  // Xử lý như trước đây nếu không phải Task object
  const endTimeIso = taskOrEndTime;
  if (!endTimeIso || status === 'completed') return false;
  
  // Chuyển đổi sang Date
  const endTime = endTimeIso instanceof Date ? endTimeIso : new Date(endTimeIso);
  const now = new Date();

  // Log để kiểm tra giá trị
  console.log("isTaskOverdue check:", {
    endTimeIso,
    endTimeFormatted: endTime.toISOString(),
    endTimeGetTime: endTime.getTime(),
    nowFormatted: now.toISOString(),
    nowGetTime: now.getTime(),
    difference: now.getTime() - endTime.getTime(),
    localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    endTimeLocal: endTime.toString(),
    nowLocal: now.toString()
  });
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(endTime.getTime())) return false;
  
  // Kiểm tra nếu đã quá hạn - sử dụng giờ hiện tại trực tiếp, không thêm offset
  const isOverdue = now.getTime() > endTime.getTime();
  console.log("isOverdue:", isOverdue);
  return isOverdue;
}

// Format date for display in a user-friendly way
export const formatDateForDisplay = (isoString: string | Date): string => {
  if (!isoString) return '';
  
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Use Intl.DateTimeFormat for consistent formatting
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

// Format date for display without time
export const formatDateOnly = (isoString: string | Date): string => {
  if (!isoString) return '';
  
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date only:', error);
    return '';
  }
};

// Format time only for display
export const formatTimeOnly = (isoString: string | Date): string => {
  if (!isoString) return '';
  
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting time only:', error);
    return '';
  }
};

// Test function to validate date formatting
export const testDateFormats = () => {
  const testCases = [
    '2025-07-20T08:30',
    '2025-07-20T14:30',
    '2025-12-31T23:59',
    '2025-01-01T00:00'
  ];
  
  console.log('=== Testing Date Format Functions ===');
  
  testCases.forEach(testCase => {
    console.log(`\nTesting: ${testCase}`);
    
    const isoResult = localDateTimeToISO(testCase);
    const localResult = isoToLocalDateTime(isoResult);
    const displayResult = formatDateForDisplay(isoResult);
    
    console.log({
      original: testCase,
      toISO: isoResult,
      backToLocal: localResult,
      display: displayResult,
      matches: testCase === localResult
    });
  });
  
  console.log('\n=== Date Format Test Complete ===');
};

// Validate ISO date string
export const isValidISODate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T') && dateString.includes('Z');
  } catch {
    return false;
  }
};

// Validate datetime-local format
export const isValidDateTimeLocal = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  return pattern.test(dateString);
};
