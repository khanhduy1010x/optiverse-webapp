import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { taskEventService } from '../../services/task-event.service';
// task_id removed from model; taskService not needed for event creation
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';
import { RootState } from '../../store';

// Helper function to generate recurring events
const generateRecurringEvents = (events: TaskEvent[]): TaskEvent[] => {
  console.log('=== GENERATING RECURRING EVENTS ===');
  console.log('Input events count:', events.length);
  
  const allEvents: TaskEvent[] = [];
  
  events.forEach((event, index) => {
    console.log(`Processing event ${index + 1}:`, {
      id: event._id,
      title: event.title,
      repeat_type: event.repeat_type,
      repeat_end_date: event.repeat_end_date,
      isRecurrence: event.isRecurrence
    });
    
    // Chỉ xử lý event gốc (không phải recurring instance)
    if (!event.isRecurrence) {
      // Thêm event gốc (luôn luôn hiển thị event gốc)
      allEvents.push(event);
      
      // Nếu event có repeat_type khác 'none', tạo các recurring instances ảo
      if (event.repeat_type && event.repeat_type !== 'none') {
        console.log(`Generating recurring instances for: ${event.title}`);
        const recurringInstances = generateRecurringInstances(event);
        console.log(`Generated ${recurringInstances.length} instances for: ${event.title}`);
        allEvents.push(...recurringInstances);
      }
    } else {
      console.log('Skipping recurring instance:', event.title);
    }
  });
  
  console.log('Final events count (base + recurring):', allEvents.length);
  console.log('=== END GENERATING RECURRING EVENTS ===');
  return allEvents;
};

// Hàm tạo các recurring instances ảo từ event gốc
const generateRecurringInstances = (originalEvent: TaskEvent): TaskEvent[] => {
  const instances: TaskEvent[] = [];
  
  try {
    if (!originalEvent.repeat_type || originalEvent.repeat_type === 'none') {
      console.log('Event has no repeat type:', originalEvent.title);
      return instances;
    }
    
    // Validation để tránh tạo quá nhiều virtual events
    const repeatInterval = originalEvent.repeat_interval || 1;
    if (repeatInterval <= 0 || repeatInterval > 365) {
      console.warn('Invalid repeat_interval:', repeatInterval, 'for event:', originalEvent.title);
      return instances;
    }
    
    const repeatOccurrences = originalEvent.repeat_occurrences || 10;
    if (repeatOccurrences > 1000) {
      console.warn('Too many repeat_occurrences:', repeatOccurrences, 'for event:', originalEvent.title);
      return instances;
    }
    
    console.log('Generating recurring instances for:', originalEvent.title, 'repeat_type:', originalEvent.repeat_type);
    
    // Lấy thông tin về sự kiện gốc
    const startDate = new Date(originalEvent.start_time);
    const endDate = originalEvent.end_time ? new Date(originalEvent.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000);
    const duration = endDate.getTime() - startDate.getTime();
    
    // Lấy các thông số lặp lại
    const repeatType = originalEvent.repeat_type;
    // Chuẩn hóa repeat_end_type: nếu có repeat_end_date thì coi như kiểu 'on' để dừng đúng ngày
    const repeatEndDate = originalEvent.repeat_end_date ? new Date(originalEvent.repeat_end_date) : null;
    const repeatEndTypeRaw = originalEvent.repeat_end_type || 'never';
    const repeatEndType = repeatEndDate ? 'on' : repeatEndTypeRaw;
    const repeatDays = originalEvent.repeat_days || [];
    const repeatUnit = originalEvent.repeat_unit || 'day';
    
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;
    // Bắt đầu từ lần lặp đầu tiên (không tạo lại event gốc)
    
    // Tính toán maxOccurrences dựa trên repeat_end_type với giới hạn an toàn
    let maxOccurrences = 10; // Mặc định
    if (repeatEndType === 'after') {
      maxOccurrences = Math.min(repeatOccurrences, 100); // Giới hạn tối đa 100 occurrences
    } else if (repeatEndDate) {
      // Tính toán ước lượng số occurrences dựa trên khoảng thời gian
      const timeDiff = repeatEndDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      let estimatedOccurrences = 50; // Mặc định
      switch (repeatType) {
        case 'daily':
          estimatedOccurrences = Math.ceil(daysDiff / repeatInterval);
          break;
        case 'weekly':
          estimatedOccurrences = Math.ceil(daysDiff / (7 * repeatInterval));
          break;
        case 'monthly':
          estimatedOccurrences = Math.ceil(daysDiff / (30 * repeatInterval));
          break;
        case 'yearly':
          estimatedOccurrences = Math.ceil(daysDiff / (365 * repeatInterval));
          break;
        case 'custom':
          if (repeatUnit === 'day') {
            estimatedOccurrences = Math.ceil(daysDiff / repeatInterval);
          } else if (repeatUnit === 'week') {
            estimatedOccurrences = Math.ceil(daysDiff / (7 * repeatInterval));
          } else if (repeatUnit === 'month') {
            estimatedOccurrences = Math.ceil(daysDiff / (30 * repeatInterval));
          } else if (repeatUnit === 'year') {
            estimatedOccurrences = Math.ceil(daysDiff / (365 * repeatInterval));
          }
          break;
      }
      
      maxOccurrences = Math.min(estimatedOccurrences + 10, 200); // Thêm buffer và giới hạn tối đa
     } else {
       // Nếu repeat_end_type là 'never', chỉ tạo một số lượng hợp lý
       maxOccurrences = 20;
     }
     
    console.log('Repeat settings:', {
      repeatType,
      repeatInterval,
      repeatEndType,
      repeatEndDate: repeatEndDate ? repeatEndDate.toISOString().split('T')[0] : null,
      repeatOccurrences,
      maxOccurrences,
      repeatDays,
      startDate: startDate.toISOString().split('T')[0]
    });
    
    console.log('Date comparison setup:', {
      startDateOnly: startDate.toISOString().split('T')[0],
      repeatEndDateOnly: repeatEndDate ? repeatEndDate.toISOString().split('T')[0] : null,
      startDateFull: startDate.toISOString(),
      repeatEndDateFull: repeatEndDate ? repeatEndDate.toISOString() : null,
      startDateLocal: startDate.toString(),
      repeatEndDateLocal: repeatEndDate ? repeatEndDate.toString() : null
    });
    
    // Hàm helper để tăng ngày theo loại repeat
    const incrementDate = (date: Date, type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday' | 'custom' | 'none', interval: number) => {
      const newDate = new Date(date);
      switch (type) {
        case 'daily':
          newDate.setDate(newDate.getDate() + interval);
          break;
        case 'weekly':
          newDate.setDate(newDate.getDate() + 7 * interval);
          break;
        case 'monthly':
          newDate.setMonth(newDate.getMonth() + interval);
          break;
        case 'yearly':
          newDate.setFullYear(newDate.getFullYear() + interval);
          break;
        case 'weekday':
          // Lặp lại vào các ngày trong tuần (thứ 2-6)
          do {
            newDate.setDate(newDate.getDate() + 1);
          } while (newDate.getDay() === 0 || newDate.getDay() === 6); // Bỏ qua CN và T7
          break;
        case 'custom':
          if (repeatUnit === 'day') {
            newDate.setDate(newDate.getDate() + interval);
          } else if (repeatUnit === 'week') {
            newDate.setDate(newDate.getDate() + 7 * interval);
          } else if (repeatUnit === 'month') {
            newDate.setMonth(newDate.getMonth() + interval);
          } else if (repeatUnit === 'year') {
            newDate.setFullYear(newDate.getFullYear() + interval);
          }
          break;
      }
      return newDate;
    };
    
    // Bắt đầu từ ngày gốc (bao gồm cả ngày đầu tiên)
    // Đối với daily repeat, bắt đầu từ chính ngày gốc
    if ((repeatType === 'weekly' || (repeatType === 'custom' && repeatUnit === 'week')) && (repeatDays?.length || 0) > 0) {
      // Với weekly/custom-week có chọn ngày trong tuần, kiểm tra xem ngày bắt đầu có nằm trong repeat_days không
      const daysSorted = [...repeatDays].sort((a, b) => a - b);
      const baseDow = startDate.getDay();
      
      // Kiểm tra xem ngày bắt đầu có trong repeat_days không
      if (repeatDays.includes(baseDow)) {
        // Ngày bắt đầu nằm trong repeat_days, bắt đầu từ ngày này
        currentDate = new Date(startDate);
      } else {
        // Tìm ngày kế tiếp trong repeat_days
        let nextDay: number | null = null;
        for (const d of daysSorted) {
          if (d > baseDow) { nextDay = d; break; }
        }
        if (nextDay !== null) {
          const delta = nextDay - baseDow;
          const candidate = new Date(startDate);
          candidate.setDate(candidate.getDate() + delta);
          currentDate = candidate;
        } else {
          // Không còn ngày phù hợp trong tuần hiện tại -> nhảy sang block tuần kế tiếp theo interval và chọn ngày đầu tiên
          const weekStart = new Date(startDate);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const nextBlockStart = new Date(weekStart);
          nextBlockStart.setDate(nextBlockStart.getDate() + 7 * repeatInterval);
          const nextCandidate = new Date(nextBlockStart);
          nextCandidate.setDate(nextCandidate.getDate() + daysSorted[0]);
          currentDate = nextCandidate;
        }
      }
    } else {
      // Với các loại khác (daily, monthly, yearly), bắt đầu từ chính ngày gốc
      currentDate = new Date(startDate);
    }
    
    // Tạo các recurring instances
     while (occurrenceCount < maxOccurrences) {
      // Kiểm tra điều kiện kết thúc - so sánh ngày với timezone handling
       if (repeatEndType === 'on' && repeatEndDate) {
         // Tạo Date object cho ngày hiện tại chỉ với ngày/tháng/năm (loại bỏ thời gian)
         const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
         const repeatEndDateOnly = new Date(repeatEndDate.getFullYear(), repeatEndDate.getMonth(), repeatEndDate.getDate());
         
         console.log(`Checking date ${occurrenceCount + 1}:`, {
           currentDate: currentDateOnly.toISOString().split('T')[0],
           repeatEndDate: repeatEndDateOnly.toISOString().split('T')[0],
           currentDateFull: currentDate.toISOString(),
           repeatEndDateFull: repeatEndDate.toISOString(),
           shouldStop: currentDateOnly > repeatEndDateOnly
         });
         
         if (currentDateOnly > repeatEndDateOnly) {
           console.log('Stopping recurring instances - reached end date');
           break;
         }
       }
      
      // Đối với weekly repeat với repeat_days, xử lý các ngày được chọn trong tuần
      if (repeatType === 'weekly' && repeatDays.length > 0) {
        const dayOfWeek = currentDate.getDay();
        
        // Nếu ngày hiện tại không nằm trong danh sách repeat_days
        if (!repeatDays.includes(dayOfWeek)) {
          // Tìm ngày tiếp theo trong repeat_days trong cùng tuần
          let nextValidDay = -1;
          for (let i = 1; i <= 7; i++) {
            const testDay = (dayOfWeek + i) % 7;
            if (repeatDays.includes(testDay)) {
              nextValidDay = testDay;
              break;
            }
          }
          
          if (nextValidDay !== -1) {
            const daysToAdd = nextValidDay > dayOfWeek ? 
              nextValidDay - dayOfWeek : 
              7 - dayOfWeek + nextValidDay;
            currentDate.setDate(currentDate.getDate() + daysToAdd);
          } else {
            // Nếu không tìm thấy ngày hợp lệ, chuyển sang tuần tiếp theo
            currentDate = incrementDate(currentDate, repeatType, repeatInterval);
            continue;
          }
        }
      }
      
      // Đối với custom repeat với repeat_days
      if (repeatType === 'custom' && repeatUnit === 'week' && repeatDays.length > 0) {
        const dayOfWeek = currentDate.getDay();
        
        if (!repeatDays.includes(dayOfWeek)) {
          // Tìm ngày tiếp theo trong repeat_days
          let nextValidDay = -1;
          for (let i = 1; i <= 7; i++) {
            const testDay = (dayOfWeek + i) % 7;
            if (repeatDays.includes(testDay)) {
              nextValidDay = testDay;
              break;
            }
          }
          
          if (nextValidDay !== -1) {
            const daysToAdd = nextValidDay > dayOfWeek ? 
              nextValidDay - dayOfWeek : 
              7 - dayOfWeek + nextValidDay;
            currentDate.setDate(currentDate.getDate() + daysToAdd);
          } else {
            // Nếu không tìm thấy ngày hợp lệ, chuyển sang chu kỳ tiếp theo
            currentDate = incrementDate(currentDate, repeatType, repeatInterval);
            continue;
          }
        }
      }
      
      // Kiểm tra xem ngày này có trong exclusion_dates không
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const currentDateString = currentDateOnly.toISOString().split('T')[0];
      const isExcluded = originalEvent.exclusion_dates?.some(excludeDate => {
        const excludeDateOnly = new Date(excludeDate);
        const excludeDateString = new Date(excludeDateOnly.getFullYear(), excludeDateOnly.getMonth(), excludeDateOnly.getDate()).toISOString().split('T')[0];
        return excludeDateString === currentDateString;
      });
      
      // Nếu ngày này bị loại trừ, bỏ qua và tiếp tục (KHÔNG tăng occurrenceCount)
      if (isExcluded) {
        // Với weekly/custom-week có danh sách repeat_days, đừng nhảy cả tuần ngay,
        // hãy thử chuyển sang ngày hợp lệ kế tiếp trong cùng tuần trước.
        if ((repeatType === 'weekly' || (repeatType === 'custom' && repeatUnit === 'week')) && repeatDays.length > 0) {
          const dayOfWeek = currentDate.getDay();
          const daysSorted = [...repeatDays].sort((a, b) => a - b);
          const nextDayInSameWeek = daysSorted.find(d => d > dayOfWeek);
          if (nextDayInSameWeek !== undefined) {
            const daysToAdd = nextDayInSameWeek - dayOfWeek;
            currentDate.setDate(currentDate.getDate() + daysToAdd);
          } else {
            // Không còn ngày hợp lệ trong tuần hiện tại -> sang block tuần tiếp theo theo interval
            const weekStart = new Date(currentDate);
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const nextBlockStart = new Date(weekStart);
            nextBlockStart.setDate(nextBlockStart.getDate() + 7 * repeatInterval);
            const nextCandidate = new Date(nextBlockStart);
            nextCandidate.setDate(nextCandidate.getDate() + daysSorted[0]);
            currentDate = nextCandidate;
          }
        } else {
          // Các loại repeat khác giữ nguyên hành việc tăng theo interval
          currentDate = incrementDate(currentDate, repeatType, repeatInterval);
        }
        continue;
      }
      
      // Tạo instance ảo - giữ nguyên thời gian từ event gốc, chỉ thay đổi ngày
      const newStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 
        startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds());
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      const recurringInstance: TaskEvent = {
        ...originalEvent,
        _id: `${originalEvent._id}::recurrence::${occurrenceCount + 1}`, // ID ảo duy nhất
        start_time: newStartDate,
        end_time: newEndDate,
        isRecurrence: true, // Đánh dấu đây là recurring instance
        parent_event_id: originalEvent._id // Liên kết với event gốc
      };
      
      instances.push(recurringInstance);
      occurrenceCount++;
      
      // Tăng ngày cho lần lặp tiếp theo
      if ((repeatType === 'weekly' || (repeatType === 'custom' && repeatUnit === 'week')) && repeatDays.length > 0) {
        const daysSorted = [...repeatDays].sort((a, b) => a - b);
        const curDow = currentDate.getDay();
        // Tìm ngày tiếp theo trong cùng tuần
        let moved = false;
        for (let i = 0; i < daysSorted.length; i++) {
          if (daysSorted[i] > curDow) {
            const delta = daysSorted[i] - curDow;
            currentDate.setDate(currentDate.getDate() + delta);
            moved = true;
            break;
          }
        }
        if (!moved) {
          // chuyển sang tuần theo interval tiếp theo và chọn ngày đầu tiên trong repeatDays
          const weekStart = new Date(currentDate);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const nextBlockStart = new Date(weekStart);
          nextBlockStart.setDate(nextBlockStart.getDate() + 7 * repeatInterval);
          const nextCandidate = new Date(nextBlockStart);
          nextCandidate.setDate(nextCandidate.getDate() + daysSorted[0]);
          currentDate = nextCandidate;
        }
      } else {
        currentDate = incrementDate(currentDate, repeatType, repeatInterval);
      }
      // Tiếp tục với lần lặp tiếp theo
    }
  } catch (error) {
    console.error('Error generating recurring instances:', error);
  }
  
  console.log('Generated', instances.length, 'recurring instances for event:', originalEvent.title);
  console.log('Recurring instances details:', instances.map(inst => ({
    id: inst._id,
    start_time: inst.start_time instanceof Date ? inst.start_time.toISOString() : inst.start_time,
    end_time: inst.end_time instanceof Date ? inst.end_time.toISOString() : inst.end_time
  })));
  return instances;
};

// Hàm createRecurringEvents và estimateEndDateFromOccurrences đã được loại bỏ vì không còn cần thiết
// Các recurring events giờ được tạo ảo trên frontend thông qua generateRecurringInstances

export const useTaskEventList = () => {
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Lấy user_id từ Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?._id;

  const fetchTaskEvents = useCallback(async () => {
    console.log('🔍 Fetching task events for current user');
    
    // Nếu không có userId, không làm gì cả
    if (!userId) {
      console.log('❌ No userId found, skipping fetch');
      setTaskEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Sử dụng method mới để lấy events theo userId
      console.log('🚀 Calling API for task events by userId:', userId);
      console.log('📡 API endpoint will be: /productivity/task-event/user');
      
      const response = await taskEventService.getTaskEventsByUserId();
        
      if (response && response.data) {
        // Hỗ trợ cả 2 định dạng dữ liệu trả về:
        // 1) ApiResponse<TaskEvent[]>  -> data: TaskEvent[]
        // 2) ApiResponse<{ taskEvents: TaskEvent[] }> -> data: { taskEvents: TaskEvent[] }
        const rawData: any = response.data?.data;
        let events: TaskEvent[] = [];
        
        console.log('🔍 Raw data type:', typeof rawData);
        console.log('🔍 Raw data is array:', Array.isArray(rawData));
        console.log('🔍 Raw data content:', rawData);
        console.log('🔍 Raw data length (if array):', Array.isArray(rawData) ? rawData.length : 'N/A');
        
        if (Array.isArray(rawData)) {
          events = rawData as TaskEvent[];
          console.log('✅ Parsed as direct array, events count:', events.length);
        } else if (rawData && Array.isArray(rawData.taskEvents)) {
          events = rawData.taskEvents as TaskEvent[];
          console.log('✅ Parsed from taskEvents property, events count:', events.length);
        } else if (rawData && typeof rawData === 'object') {
          // Kiểm tra các key khác có thể chứa array
          const possibleArrayKeys = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
          console.log('🔍 Possible array keys in response:', possibleArrayKeys);
          
          if (possibleArrayKeys.length > 0) {
            events = rawData[possibleArrayKeys[0]] as TaskEvent[];
            console.log('✅ Found events in key:', possibleArrayKeys[0], 'count:', events.length);
          } else {
            console.warn('⚠️ No array found in response data');
          }
        } else {
          console.warn('⚠️ Unexpected task events response shape:', rawData);
          console.warn('⚠️ Response structure:', {
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            rawDataType: typeof rawData,
            rawDataKeys: rawData && typeof rawData === 'object' ? Object.keys(rawData) : []
          });
        }
        
        console.log('📋 Final parsed events count:', events.length);
        if (events.length > 0) {
          console.log('📝 Sample event structure:', {
            id: events[0]._id,
            title: events[0].title,
            start_time: events[0].start_time,
            end_time: events[0].end_time,
            repeat_type: events[0].repeat_type
          });
          console.log('📝 Full sample event:', events[0]);
        }
        
        // Validate và format events
        const validEvents = events.filter(event => {
          if (!event._id || !event.title) {
            console.warn('⚠️ Invalid event found (missing id or title):', event);
            return false;
          }
          return true;
        });
        
        console.log('✅ Valid events after filtering:', validEvents.length);
        
        const formattedEvents = validEvents.map(event => ({
          ...event,
          start_time: event.start_time ? new Date(event.start_time) : new Date(),
          end_time: event.end_time ? new Date(event.end_time) : undefined
        }));
        
        // Tạo các sự kiện lặp lại ảo từ events gốc
        const allEventsWithRecurring = generateRecurringEvents(formattedEvents);
        console.log('🔄 Generated events with recurring instances:', allEventsWithRecurring.length, 'total events');
        
        // Log events by date for debugging
        const eventsByDate = allEventsWithRecurring.reduce((acc, event) => {
          const startTime = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
          const dateKey = startTime.toISOString().split('T')[0];
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(event.title);
          return acc;
        }, {} as Record<string, string[]>);
        
        console.log('📅 Events grouped by date:', eventsByDate);
        
        setTaskEvents(allEventsWithRecurring);
      } else {
        console.log('❌ No data in response or invalid response structure');
        setTaskEvents([]);
      }
    } catch (err: any) {
      console.error('❌ Error in useTaskEventList:', err);
      console.error('❌ Error details:', {
        message: err?.message,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data
      });
      setError('Failed to fetch task events');
      setTaskEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Thay đổi dependency từ taskId sang userId

  // Hàm để trigger refresh từ bên ngoài - thực hiện fetch ngay lập tức
  // Sử dụng cho header refresh button - hiển thị loading state
  const refreshTaskEvents = useCallback(async () => {
    console.log('[Header Refresh] Manual refresh triggered - fetching events directly');
    // Fetch dữ liệu trực tiếp thay vì sử dụng refreshKey
    if (!userId) {
      console.log('❌ No userId found, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskEventService.getTaskEventsByUserId();
      
      if (response && response.data) {
        const rawData: any = response.data?.data;
        let events: TaskEvent[] = [];
        
        if (Array.isArray(rawData)) {
          events = rawData as TaskEvent[];
          console.log('✅ Parsed as direct array, events count:', events.length);
        } else if (rawData && Array.isArray(rawData.taskEvents)) {
          events = rawData.taskEvents as TaskEvent[];
          console.log('✅ Parsed from taskEvents property, events count:', events.length);
        } else if (rawData && typeof rawData === 'object') {
          const possibleArrayKeys = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
          if (possibleArrayKeys.length > 0) {
            events = rawData[possibleArrayKeys[0]] as TaskEvent[];
            console.log('✅ Found events in key:', possibleArrayKeys[0], 'count:', events.length);
          }
        }
        
        console.log('📋 Refreshed events count:', events.length);
        
        const validEvents = events.filter(event => {
          if (!event._id || !event.title) {
            return false;
          }
          return true;
        });
        
        const formattedEvents = validEvents.map(event => ({
          ...event,
          start_time: event.start_time ? new Date(event.start_time) : new Date(),
          end_time: event.end_time ? new Date(event.end_time) : undefined
        }));
        
        const allEventsWithRecurring = generateRecurringEvents(formattedEvents);
        console.log('🔄 Refreshed events with recurring instances:', allEventsWithRecurring.length, 'total events');
        
        setTaskEvents(allEventsWithRecurring);
      } else {
        console.log('❌ No data in refresh response');
        setTaskEvents([]);
      }
    } catch (err: any) {
      console.error('❌ Error in refreshTaskEvents:', err);
      setError('Failed to refresh task events');
      setTaskEvents([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency - userId được access từ closure

  // Hàm refresh riêng cho import modal - KHÔNG hiển thị loading state toàn trang
  // Giữ modal mở và chỉ cập nhật data ở background
  const refreshImportedEvents = useCallback(async () => {
    console.log('[Import Modal Refresh] Refreshing imported events without closing modal');
    if (!userId) {
      console.log('❌ No userId found, skipping fetch');
      return;
    }
    
    // KHÔNG set loading = true để tránh hiển thị loading state
    setError(null);
    
    try {
      const response = await taskEventService.getTaskEventsByUserId();
      
      if (response && response.data) {
        const rawData: any = response.data?.data;
        let events: TaskEvent[] = [];
        
        if (Array.isArray(rawData)) {
          events = rawData as TaskEvent[];
          console.log('✅ [Import] Parsed as direct array, events count:', events.length);
        } else if (rawData && Array.isArray(rawData.taskEvents)) {
          events = rawData.taskEvents as TaskEvent[];
          console.log('✅ [Import] Parsed from taskEvents property, events count:', events.length);
        } else if (rawData && typeof rawData === 'object') {
          const possibleArrayKeys = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
          if (possibleArrayKeys.length > 0) {
            events = rawData[possibleArrayKeys[0]] as TaskEvent[];
            console.log('✅ [Import] Found events in key:', possibleArrayKeys[0], 'count:', events.length);
          }
        }
        
        console.log('📋 [Import] Refreshed events count:', events.length);
        
        const validEvents = events.filter(event => {
          if (!event._id || !event.title) {
            return false;
          }
          return true;
        });
        
        const formattedEvents = validEvents.map(event => ({
          ...event,
          start_time: event.start_time ? new Date(event.start_time) : new Date(),
          end_time: event.end_time ? new Date(event.end_time) : undefined
        }));
        
        const allEventsWithRecurring = generateRecurringEvents(formattedEvents);
        console.log('🔄 [Import] Refreshed events with recurring instances:', allEventsWithRecurring.length, 'total events');
        
        setTaskEvents(allEventsWithRecurring);
      } else {
        console.log('❌ No data in import refresh response');
      }
    } catch (err: any) {
      console.error('❌ Error in refreshImportedEvents:', err);
      // KHÔNG set error để tránh thay đổi UI state
    }
    // KHÔNG set loading = false vì không bao giờ set = true
  }, []); // Empty dependency - userId được access từ closure

  // Hàm thêm sự kiện mới - chỉ lưu 1 event gốc vào database, virtual instances sẽ được tạo tự động
  const addEvent = async (newEvent: TaskEvent) => {
    console.log('=== ADDING NEW EVENT ===');
    console.log('Event data:', newEvent);
    console.log('Repeat settings:', {
      repeat_type: newEvent.repeat_type,
      repeat_end_type: newEvent.repeat_end_type,
      repeat_end_date: newEvent.repeat_end_date,
      repeat_interval: newEvent.repeat_interval
    });
    
    try {
      // Chuẩn bị dữ liệu để gửi lên server - chỉ lưu event gốc
      const eventToCreate: CreateTaskEventRequest = {
        user_id: userId || '',
        title: newEvent.title,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        all_day: newEvent.all_day,
        repeat_type: newEvent.repeat_type,
        repeat_interval: newEvent.repeat_interval,
        repeat_days: newEvent.repeat_days,
        repeat_end_type: newEvent.repeat_end_type,
        repeat_end_date: newEvent.repeat_end_date,
        repeat_occurrences: newEvent.repeat_occurrences,
        exclusion_dates: newEvent.exclusion_dates,
        location: newEvent.location,
        description: newEvent.description,
        guests: newEvent.guests
      };
      
      console.log('Event to create on server:', eventToCreate);
      
      // Tạo sự kiện trong cơ sở dữ liệu (chỉ lưu event gốc)
      const response = await taskEventService.createTaskEvent(eventToCreate);
      
      console.log('Server response:', response);
      
      if (response && response.data && response.data.data) {
        const createdEvent = response.data.data;
        
        console.log('✅ Event created successfully on server:', createdEvent._id);
        console.log('🔄 Fetching latest data from server immediately...');
        
        // Fetch lại data từ server ngay lập tức để đảm bảo đồng bộ
        await refreshTaskEvents();
        
        console.log('✅ Data refreshed successfully after creating event');
      }
    } catch (error) {
      console.error('=== ERROR ADDING EVENT ===');
      console.error('Error details:', error);
      throw error; // Re-throw để component có thể handle error
    }
  };

  // Hàm xóa sự kiện với options: 'all' (xóa toàn bộ series) hoặc 'this' (chỉ xóa instance này)
  const removeEvent = async (
    eventId: string,
    deleteOption: 'all' | 'this' = 'all',
    instanceStartTime?: Date | string
  ) => {
    console.log('Removing event from local state and database:', eventId, 'Option:', deleteOption);
    console.log('Instance start time provided:', instanceStartTime);
    
    try {
      // Kiểm tra xem đây có phải là recurring instance không
      const isRecurringInstance = eventId.includes('::recurrence::');
      
      if (isRecurringInstance) {
        // Lấy ID của event gốc
        const parentEventId = eventId.split('::recurrence::')[0];
        console.log('Parent event ID:', parentEventId);
        
        if (deleteOption === 'all') {
          // Xóa toàn bộ series - xóa event gốc
          await taskEventService.deleteTaskEvent(parentEventId);
          console.log('✅ Event series deleted successfully');
          console.log('🔄 Fetching latest data from server immediately...');
          
          // Fetch lại data từ server ngay lập tức
          await refreshTaskEvents();
          
          console.log('✅ Data refreshed successfully after deleting series');
        } else {
          // Xóa chỉ instance này - thêm ngày vào exclusion_dates
          console.log('Deleting single instance - adding to exclusion_dates');

          const parentEvent = taskEvents.find(e => e._id === parentEventId && !e.isRecurrence);
          console.log('Found parent event:', parentEvent?.title);
          
          if (parentEvent) {
            let instanceDateSrc: Date | null = null;
            
            // Ưu tiên dùng instanceStartTime từ UI
            if (instanceStartTime) {
              instanceDateSrc = new Date(instanceStartTime);
              console.log('Using provided instanceStartTime:', instanceDateSrc);
            } else {
              // Fallback: tìm instance trong danh sách generated
              const instances = generateRecurringInstances(parentEvent);
              const targetInstance = instances.find(inst => inst._id === eventId);
              if (targetInstance) {
                instanceDateSrc = new Date(targetInstance.start_time);
                console.log('Found target instance via generation:', instanceDateSrc);
              }
            }

            if (instanceDateSrc) {
              // Tạo date object chỉ với ngày (không có thời gian) để đảm bảo so sánh chính xác
              const instanceDateOnly = new Date(
                instanceDateSrc.getFullYear(),
                instanceDateSrc.getMonth(),
                instanceDateSrc.getDate()
              );
              
              console.log('Instance date to exclude:', instanceDateOnly.toISOString().split('T')[0]);
              console.log('Current exclusion_dates:', parentEvent.exclusion_dates);

              // Kiểm tra xem ngày này đã có trong exclusion_dates chưa
              const existingExclusions = parentEvent.exclusion_dates || [];
              const isAlreadyExcluded = existingExclusions.some(excludeDate => {
                const excludeDateOnly = new Date(excludeDate);
                const excludeDateNormalized = new Date(
                  excludeDateOnly.getFullYear(),
                  excludeDateOnly.getMonth(),
                  excludeDateOnly.getDate()
                );
                return excludeDateNormalized.getTime() === instanceDateOnly.getTime();
              });

              if (isAlreadyExcluded) {
                console.log('Date already excluded, skipping update');
                return;
              }

              const updatedExclusionDates = [...existingExclusions, instanceDateOnly];
              console.log('Updated exclusion_dates:', updatedExclusionDates.map(d => new Date(d).toISOString().split('T')[0]));

              const parentEventUpdate: UpdateTaskEventRequest = {
                exclusion_dates: updatedExclusionDates
              };

              // Cập nhật event gốc ở DB để loại trừ instance đã xóa
              console.log('Updating parent event with exclusion_dates...');
              await taskEventService.updateTaskEvent(parentEventId, parentEventUpdate);
              console.log('✅ Single instance excluded successfully');
              console.log('🔄 Fetching latest data from server immediately...');
              
              // Fetch lại data từ server ngay lập tức
              await refreshTaskEvents();
              
              console.log('✅ Data refreshed successfully after excluding instance');
            } else {
              console.warn('Could not resolve instance date for deletion, skipping exclusion update.');
              console.warn('EventId:', eventId);
              console.warn('InstanceStartTime:', instanceStartTime);
            }
          } else {
            console.warn('Parent event not found for ID:', parentEventId);
          }
        }
      } else {
        // Đây là event gốc hoặc event đơn
        console.log('Deleting single/root event');
        // Xóa event ở DB
        await taskEventService.deleteTaskEvent(eventId);
        console.log('✅ Event deleted successfully');
        console.log('🔄 Fetching latest data from server immediately...');
        
        // Fetch lại data từ server ngay lập tức
        await refreshTaskEvents();
        
        console.log('✅ Data refreshed successfully after deleting event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      console.error('Error details:', {
        eventId,
        deleteOption,
        instanceStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Hàm cập nhật sự kiện với options: 'all' (cập nhật toàn bộ series) hoặc 'this' (chỉ cập nhật instance này)
  const updateEvent = async (eventId: string, updatedEvent: TaskEvent, updateOption: 'all' | 'this' = 'all') => {
    console.log('Updating event in local state and database:', eventId, 'Option:', updateOption);
    
    try {
      // Kiểm tra xem đây có phải là recurring instance không
      const isRecurringInstance = eventId.includes('::recurrence::');
      
      if (isRecurringInstance) {
        // Lấy ID của event gốc
        const parentEventId = eventId.split('::recurrence::')[0];
        
        if (updateOption === 'all') {
          // Cập nhật toàn bộ series - cập nhật event gốc và giữ nguyên ngày gốc
          const parentEvent = taskEvents.find(e => e._id === parentEventId && !e.isRecurrence);
          const baseStart = parentEvent ? new Date(parentEvent.start_time) : new Date(updatedEvent.start_time);
          const updatedStart = new Date(updatedEvent.start_time);
          const updatedEnd = updatedEvent.end_time ? new Date(updatedEvent.end_time) : undefined;
          
          const combineDateAndTime = (datePart: Date, timePart: Date) =>
            new Date(
              datePart.getFullYear(),
              datePart.getMonth(),
              datePart.getDate(),
              timePart.getHours(),
              timePart.getMinutes(),
              timePart.getSeconds(),
              timePart.getMilliseconds()
            );
          
          const defaultDuration = parentEvent?.end_time && parentEvent?.start_time
            ? (new Date(parentEvent.end_time).getTime() - new Date(parentEvent.start_time).getTime())
            : 60 * 60 * 1000; // fallback 1h
          
          const durationMs = updatedEnd && updatedEnd >= updatedStart
            ? (updatedEnd.getTime() - updatedStart.getTime())
            : defaultDuration;
          
          const newStartTime = combineDateAndTime(baseStart, updatedStart);
          const newEndTime = updatedEvent.end_time ? new Date(newStartTime.getTime() + durationMs) : undefined;
          
          const eventToUpdate: UpdateTaskEventRequest = {
            title: updatedEvent.title,
            start_time: newStartTime,
            end_time: newEndTime,
            all_day: updatedEvent.all_day,
            repeat_type: updatedEvent.repeat_type,
            repeat_interval: updatedEvent.repeat_interval,
            repeat_days: updatedEvent.repeat_days,
            repeat_end_type: updatedEvent.repeat_end_type,
            repeat_end_date: updatedEvent.repeat_end_date,
            repeat_occurrences: updatedEvent.repeat_occurrences,
            exclusion_dates: updatedEvent.exclusion_dates,
            location: updatedEvent.location,
            description: updatedEvent.description,
            guests: updatedEvent.guests,
            color: updatedEvent.color
          };
          
          const response = await taskEventService.updateTaskEvent(parentEventId, eventToUpdate);
          
          if (response && response.data && response.data.data) {
            console.log('✅ Event series updated successfully on server');
            console.log('🔄 Fetching latest data from server immediately...');
            
            // Fetch lại data từ server ngay lập tức để đảm bảo đồng bộ
            await refreshTaskEvents();
            
            console.log('✅ Data refreshed successfully after updating series');
          }
        } else {
          // Cập nhật chỉ instance này - thêm ngày vào exclusion_dates và tạo event mới
          console.log('Updating single instance - adding to exclusion_dates and creating new event');
          
          // Tìm event gốc
          const parentEvent = taskEvents.find(e => e._id === parentEventId && !e.isRecurrence);
          if (parentEvent) {
            // Xác định đúng ngày của instance gốc dựa vào ID instance
            const instances = generateRecurringInstances(parentEvent);
            const targetInstance = instances.find(inst => inst._id === eventId);
            const instanceDateSrc = targetInstance ? new Date(targetInstance.start_time) : new Date(updatedEvent.start_time);
            const instanceDateOnly = new Date(
              instanceDateSrc.getFullYear(),
              instanceDateSrc.getMonth(),
              instanceDateSrc.getDate()
            );
          
            // Thêm ngày vào exclusion_dates của event gốc
            const updatedExclusionDates = [...(parentEvent.exclusion_dates || []), instanceDateOnly];
          
            const parentEventUpdate: UpdateTaskEventRequest = {
              exclusion_dates: updatedExclusionDates
            };
          
            // Cập nhật event gốc với exclusion_dates mới
            await taskEventService.updateTaskEvent(parentEventId, parentEventUpdate);
          
            // Tạo event mới với repeat_type = 'none'
            const newSingleEvent: CreateTaskEventRequest = {
              user_id: userId || '', // Sử dụng userId từ Redux store
              title: updatedEvent.title,
              start_time: updatedEvent.start_time,
              end_time: updatedEvent.end_time,
              all_day: updatedEvent.all_day,
              repeat_type: 'none',
              location: updatedEvent.location,
              description: updatedEvent.description,
              guests: updatedEvent.guests,
              color: updatedEvent.color
            };
          
            const response = await taskEventService.createTaskEvent(newSingleEvent);
          
            if (response && response.data && response.data.data) {
              console.log('✅ Single instance updated successfully (new event created)');
              console.log('🔄 Fetching latest data from server immediately...');
              
              // Fetch lại data từ server ngay lập tức để đảm bảo đồng bộ
              await refreshTaskEvents();
              
              console.log('✅ Data refreshed successfully after updating single instance');
            }
          }
        }
      } else {
        // Đây là event gốc hoặc event đơn
        const eventToUpdate: UpdateTaskEventRequest = {
          title: updatedEvent.title,
          start_time: updatedEvent.start_time,
          end_time: updatedEvent.end_time,
          all_day: updatedEvent.all_day,
          repeat_type: updatedEvent.repeat_type,
          repeat_interval: updatedEvent.repeat_interval,
          repeat_days: updatedEvent.repeat_days,
          repeat_end_type: updatedEvent.repeat_end_type,
          repeat_end_date: updatedEvent.repeat_end_date,
          repeat_occurrences: updatedEvent.repeat_occurrences,
          exclusion_dates: updatedEvent.exclusion_dates,
          location: updatedEvent.location,
          description: updatedEvent.description,
          guests: updatedEvent.guests,
          color: updatedEvent.color
        };
        
        const response = await taskEventService.updateTaskEvent(eventId, eventToUpdate);
        
        if (response && response.data && response.data.data) {
          console.log('✅ Event updated successfully on server');
          console.log('🔄 Fetching latest data from server immediately...');
          
          // Fetch lại data từ server ngay lập tức để đảm bảo đồng bộ
          await refreshTaskEvents();
          
          console.log('✅ Data refreshed successfully after updating event');
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Fetch dữ liệu khi taskId hoặc refreshKey thay đổi
  useEffect(() => {
    console.log('UserId or refreshKey changed, fetching events');
    fetchTaskEvents();
  }, [userId, refreshKey, fetchTaskEvents]);

  // Chỉ trả ra danh sách hiển thị: tất cả instance ảo + các event không lặp (repeat_type === 'none')
  const visibleEvents = taskEvents.filter(e => e.isRecurrence || !e.repeat_type || e.repeat_type === 'none');
  return {
    taskEvents: visibleEvents,
    loading,
    error,
    refreshImportedEvents,
    addEvent,
    removeEvent,
    updateEvent
  };
};
  // No task_id provisioning needed anymore