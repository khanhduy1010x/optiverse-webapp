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
  
  // Lấy thời gian từ chuỗi ISO trực tiếp để tránh chuyển đổi múi giờ
  if (typeof isoString === 'string') {
    // Lấy thông tin thời gian từ chuỗi ISO
    const matches = isoString.match(/T(\d{2}):(\d{2})/);
    if (matches) {
      const hour = matches[1];
      const minute = matches[2];
      
      // Format ngày tháng
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Kết hợp ngày tháng và giờ phút
      return `${formatter.format(date)} ${hour}:${minute}`;
    }
  }
  
  // Fallback nếu không phải chuỗi ISO
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return formatter.format(date);
};

// Convert local datetime-local input value to ISO string with proper timezone handling
export const localDateTimeToISO = (dateTimeValue: string): string => {
  if (!dateTimeValue) return '';
  
  // Tạo một đối tượng Date từ giá trị datetime-local
  // Giữ nguyên giờ mà người dùng nhập, không chuyển đổi múi giờ
  const [datePart, timePart] = dateTimeValue.split('T');
  if (!datePart || !timePart) return '';
  
  // Tạo chuỗi ISO với múi giờ UTC (Z)
  return `${datePart}T${timePart}:00.000Z`;
};

// Convert ISO string to local datetime-local input value
export const isoToLocalDateTime = (isoString: string | Date): string => {
  if (!isoString) return '';
  
  let dateString = '';
  
  if (typeof isoString === 'string') {
    // Trích xuất phần ngày và giờ từ chuỗi ISO, bỏ qua múi giờ
    const matches = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (matches) {
      return `${matches[1]}T${matches[2]}`;
    }
    
    // Nếu không phải định dạng ISO chuẩn, chuyển thành đối tượng Date
    dateString = isoString;
  } else {
    dateString = isoString.toISOString();
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // Format YYYY-MM-DDThh:mm (định dạng yêu cầu cho input datetime-local)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
