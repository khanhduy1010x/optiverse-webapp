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

/**
 * Tính thời gian còn lại đến deadline và trả về chuỗi hiển thị đếm ngược
 * @param endTimeIso Thời gian kết thúc dưới dạng chuỗi ISO hoặc đối tượng Date
 * @returns Chuỗi hiển thị thời gian còn lại, ví dụ: "2 days left", "5 hours left", "30 minutes left"
 */
export function getCountdownString(endTimeIso: string | Date): string {
  if (!endTimeIso) return '';
  
  let endTime: Date;
  
  // Xử lý chuỗi ISO đặc biệt để tránh vấn đề múi giờ
  if (typeof endTimeIso === 'string') {
    // Trích xuất ngày và giờ từ chuỗi ISO, bỏ qua múi giờ
    const matches = endTimeIso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (matches) {
      // Tạo đối tượng Date với múi giờ địa phương
      const [, datePart, timePart] = matches;
      const dateStr = `${datePart}T${timePart}:00`;
      endTime = new Date(dateStr);
    } else {
      // Fallback nếu không phải định dạng mong đợi
      endTime = new Date(endTimeIso);
    }
  } else {
    endTime = endTimeIso;
  }
  
  if (isNaN(endTime.getTime())) return '';
  
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Cộng thêm 7 tiếng
  
  // Tính khoảng thời gian còn lại tính bằng mili giây
  const timeLeft = endTime.getTime() - now.getTime();
  
  // Nếu đã quá hạn, trả về chuỗi trống
  if (timeLeft <= 0) return '';
  
  // Chuyển đổi thành giây
  const secondsLeft = Math.floor(timeLeft / 1000);
  
  // Tính toán các đơn vị thời gian
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  
  // Hiển thị đơn vị thời gian lớn nhất
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  } else {
    return 'Less than a minute left';
  }
}

/**
 * Kiểm tra xem task đã quá 3/4 thời gian từ start đến end chưa, và vẫn đang ở trạng thái pending
 * @param startTimeIso Thời gian bắt đầu task
 * @param endTimeIso Thời gian kết thúc task
 * @param status Trạng thái hiện tại của task
 * @returns true nếu task đã qua 3/4 thời gian và vẫn pending, false trong các trường hợp khác
 */
export function isTaskNearDue(startTimeIso: string | Date, endTimeIso: string | Date, status: string): boolean {
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
 * @param endTimeIso Thời gian kết thúc task
 * @param status Trạng thái hiện tại của task
 * @returns true nếu task đã quá hạn và vẫn chưa completed, false trong các trường hợp khác
 */
export function isTaskOverdue(endTimeIso: string | Date, status: string): boolean {
  if (!endTimeIso || status === 'completed') return false;
  
  // Chuyển đổi sang Date
  const endTime = endTimeIso instanceof Date ? endTimeIso : new Date(endTimeIso);
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Cộng thêm 7 tiếng

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
  
  // Kiểm tra nếu đã quá hạn
  const isOverdue = nowVN.getTime() > endTime.getTime();
  console.log("isOverdue:", isOverdue);
  return isOverdue;
}
