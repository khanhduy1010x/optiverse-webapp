import { useState, useEffect, useCallback } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { taskEventService } from '../../services/task-event.service';

// Helper function to generate recurring events
const generateRecurringEvents = (events: TaskEvent[]): TaskEvent[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Look ahead 3 months for recurring events
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  
  const recurringEvents: TaskEvent[] = [];
  
  events.forEach(event => {
    // Add the original event first
    recurringEvents.push(event);
    
    if (event.repeat_type === 'none') {
      return; // Skip non-recurring events
    }
    
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : undefined;
    const eventDuration = endTime ? endTime.getTime() - startTime.getTime() : 0;
    
    // Calculate end date for recurring events
    let endDate = futureDate;
    if (event.repeat_end_type === 'on' && event.repeat_end_date) {
      const specificEndDate = new Date(event.repeat_end_date);
      if (specificEndDate < futureDate) {
        endDate = specificEndDate;
      }
    }
    
    // Calculate max occurrences
    let maxOccurrences = 100; // Default max occurrences to prevent infinite loops
    if (event.repeat_end_type === 'after' && event.repeat_occurrences) {
      maxOccurrences = event.repeat_occurrences;
    }
    
    // Handle different recurrence types
    switch (event.repeat_type) {
      case 'daily': {
        const interval = event.repeat_interval || 1;
        let currentDate = new Date(startTime);
        currentDate.setDate(currentDate.getDate() + interval); // Start with next occurrence
        
        let occurrenceCount = 1; // Count the original event
        while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
          // Check if we've reached the occurrence limit
          if (event.repeat_end_type === 'after' && event.repeat_occurrences && 
              occurrenceCount >= event.repeat_occurrences) {
            break;
          }
          
          const newStartTime = new Date(currentDate);
          newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
          
          let newEndTime;
          if (endTime) {
            newEndTime = new Date(newStartTime.getTime() + eventDuration);
          }
          
          recurringEvents.push({
            ...event,
            _id: `${event._id}-recurrence-${occurrenceCount}`,
            start_time: newStartTime,
            end_time: newEndTime,
            isRecurrence: true // Mark as a generated recurrence
          });
          
          occurrenceCount++;
          currentDate.setDate(currentDate.getDate() + interval);
        }
        break;
      }
      
      case 'weekly': {
        const interval = event.repeat_interval || 1;
        let occurrenceCount = 1; // Count the original event
        
        // Get the days of week to repeat on
        const daysOfWeek = event.repeat_days && event.repeat_days.length > 0 
          ? event.repeat_days 
          : [startTime.getDay()]; // Default to the day of the original event
        
        // Start with the next day after the original event
        let currentDate = new Date(startTime);
        currentDate.setDate(currentDate.getDate() + 1);
        
        while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
          // Check if we've reached the occurrence limit
          if (event.repeat_end_type === 'after' && event.repeat_occurrences && 
              occurrenceCount >= event.repeat_occurrences) {
            break;
          }
          
          const dayOfWeek = currentDate.getDay();
          
          // If this day of the week is in our repeat days
          if (daysOfWeek.includes(dayOfWeek)) {
            // For the first week, make sure we're not duplicating the original event
            const isFirstWeek = Math.floor((currentDate.getTime() - startTime.getTime()) / (24 * 60 * 60 * 1000)) < 7;
            const isSameWeekday = dayOfWeek === startTime.getDay();
            
            if (!isFirstWeek || !isSameWeekday) {
              const newStartTime = new Date(currentDate);
              newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
              
              let newEndTime;
              if (endTime) {
                newEndTime = new Date(newStartTime.getTime() + eventDuration);
              }
              
              recurringEvents.push({
                ...event,
                _id: `${event._id}-recurrence-${occurrenceCount}`,
                start_time: newStartTime,
                end_time: newEndTime,
                isRecurrence: true // Mark as a generated recurrence
              });
              
              occurrenceCount++;
            }
          }
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
          
          // If we've completed a full week interval, skip ahead
          const weeksSinceStart = Math.floor((currentDate.getTime() - startTime.getTime()) / (7 * 24 * 60 * 60 * 1000));
          if (interval > 1 && weeksSinceStart % interval === 0 && currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() + (7 * (interval - 1)));
          }
        }
        break;
      }
      
      case 'monthly': {
        const interval = event.repeat_interval || 1;
        let occurrenceCount = 1; // Count the original event
        
        // Get the day of the month from the original event
        const dayOfMonth = startTime.getDate();
        
        // Start with the next month
        let currentDate = new Date(startTime);
        currentDate.setMonth(currentDate.getMonth() + interval);
        
        while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
          // Check if we've reached the occurrence limit
          if (event.repeat_end_type === 'after' && event.repeat_occurrences && 
              occurrenceCount >= event.repeat_occurrences) {
            break;
          }
          
          // Set to the same day of month (handle month length differences)
          currentDate.setDate(Math.min(dayOfMonth, new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()));
          
          const newStartTime = new Date(currentDate);
          newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
          
          let newEndTime;
          if (endTime) {
            newEndTime = new Date(newStartTime.getTime() + eventDuration);
          }
          
          recurringEvents.push({
            ...event,
            _id: `${event._id}-recurrence-${occurrenceCount}`,
            start_time: newStartTime,
            end_time: newEndTime,
            isRecurrence: true // Mark as a generated recurrence
          });
          
          occurrenceCount++;
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
        break;
      }
      
      case 'yearly': {
        const interval = event.repeat_interval || 1;
        let occurrenceCount = 1; // Count the original event
        
        // Start with the next year
        let currentDate = new Date(startTime);
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        
        while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
          // Check if we've reached the occurrence limit
          if (event.repeat_end_type === 'after' && event.repeat_occurrences && 
              occurrenceCount >= event.repeat_occurrences) {
            break;
          }
          
          const newStartTime = new Date(currentDate);
          newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
          
          let newEndTime;
          if (endTime) {
            newEndTime = new Date(newStartTime.getTime() + eventDuration);
          }
          
          recurringEvents.push({
            ...event,
            _id: `${event._id}-recurrence-${occurrenceCount}`,
            start_time: newStartTime,
            end_time: newEndTime,
            isRecurrence: true // Mark as a generated recurrence
          });
          
          occurrenceCount++;
          currentDate.setFullYear(currentDate.getFullYear() + interval);
        }
        break;
      }
      
      case 'custom': {
        const interval = event.repeat_interval || 1;
        let occurrenceCount = 1; // Count the original event
        
        // Xác định đơn vị thời gian dựa trên repeat_interval
        // Giả định rằng custom repeat sử dụng tuần làm đơn vị mặc định
        // Trong thực tế, bạn có thể cần một trường bổ sung để lưu đơn vị (ngày, tuần, tháng, năm)
        
        // Get the days of week to repeat on (nếu đơn vị là tuần)
        const daysOfWeek = event.repeat_days && event.repeat_days.length > 0 
          ? event.repeat_days 
          : [startTime.getDay()]; // Default to the day of the original event
        
        // Start with the next day after the original event
        let currentDate = new Date(startTime);
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Xử lý tương tự như weekly, nhưng với interval tùy chỉnh
        while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
          // Check if we've reached the occurrence limit
          if (event.repeat_end_type === 'after' && event.repeat_occurrences && 
              occurrenceCount >= event.repeat_occurrences) {
            break;
          }
          
          const dayOfWeek = currentDate.getDay();
          
          // If this day of the week is in our repeat days
          if (daysOfWeek.includes(dayOfWeek)) {
            // For the first week, make sure we're not duplicating the original event
            const isFirstWeek = Math.floor((currentDate.getTime() - startTime.getTime()) / (24 * 60 * 60 * 1000)) < 7 * interval;
            const isSameWeekday = dayOfWeek === startTime.getDay();
            
            if (!isFirstWeek || !isSameWeekday) {
              const newStartTime = new Date(currentDate);
              newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
              
              let newEndTime;
              if (endTime) {
                newEndTime = new Date(newStartTime.getTime() + eventDuration);
              }
              
              // Kiểm tra xem sự kiện này có nằm trong khoảng thời gian lặp lại không
              const weeksSinceStart = Math.floor((currentDate.getTime() - startTime.getTime()) / (7 * 24 * 60 * 60 * 1000));
              if (weeksSinceStart % interval === 0) {
                recurringEvents.push({
                  ...event,
                  _id: `${event._id}-recurrence-${occurrenceCount}`,
                  start_time: newStartTime,
                  end_time: newEndTime,
                  isRecurrence: true // Mark as a generated recurrence
                });
                
                occurrenceCount++;
              }
            }
          }
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
      }
    }
  });
  
  return recurringEvents;
};

export const useTaskEventList = (taskId: string) => {
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchTaskEvents = useCallback(async () => {
    console.log('Fetching task events for taskId:', taskId);
    
    // Nếu không có taskId, không làm gì cả
    if (!taskId) {
      console.log('No taskId provided, skipping fetch');
      setTaskEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Luôn lấy dữ liệu từ API
      console.log('Calling API for task events with taskId:', taskId);
      const response = await taskEventService.getTaskEventsByTaskId(taskId);
      console.log('API response:', response);
      
      if (response && response.data) {
        // Chuyển đổi chuỗi thời gian thành đối tượng Date
        const events = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Parsed events:', events);
        
        const formattedEvents = events.map(event => ({
          ...event,
          start_time: event.start_time ? new Date(event.start_time) : new Date(),
          end_time: event.end_time ? new Date(event.end_time) : undefined
        }));
        
        // Generate recurring events
        const eventsWithRecurrences = generateRecurringEvents(formattedEvents);
        
        setTaskEvents(eventsWithRecurrences);
      } else {
        console.log('No data in response or invalid response structure');
        setTaskEvents([]);
      }
    } catch (err) {
      console.error('Error in useTaskEventList:', err);
      setError('Failed to fetch task events');
      setTaskEvents([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Hàm để trigger refresh từ bên ngoài
  const refreshTaskEvents = useCallback(() => {
    console.log('Manual refresh triggered');
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Thêm hàm thêm sự kiện mới vào state local
  const addEvent = (event: TaskEvent) => {
    console.log('Adding event to local state:', event);
    setTaskEvents(prev => {
      const updatedEvents = [...prev, event];
      return generateRecurringEvents(updatedEvents.filter(e => !e.isRecurrence));
    });
  };

  // Thêm hàm xóa sự kiện khỏi state local
  const removeEvent = (eventId: string) => {
    console.log('Removing event from local state:', eventId);
    // If it's a recurrence, extract the original event ID
    const originalId = eventId.includes('-recurrence-') ? eventId.split('-recurrence-')[0] : eventId;
    
    setTaskEvents(prev => {
      const filteredEvents = prev.filter(event => 
        !event._id.toString().startsWith(originalId)
      );
      return filteredEvents;
    });
  };

  // Thêm hàm cập nhật sự kiện trong state local
  const updateEvent = (eventId: string, updatedEvent: TaskEvent) => {
    console.log('Updating event in local state:', eventId, updatedEvent);
    // If it's a recurrence, extract the original event ID
    const originalId = eventId.includes('-recurrence-') ? eventId.split('-recurrence-')[0] : eventId;
    
    setTaskEvents(prev => {
      // Remove all recurrences of this event
      const filteredEvents = prev.filter(event => 
        !event._id.toString().startsWith(originalId) || event._id === originalId
      );
      
      // Update the original event
      const updatedEvents = filteredEvents.map(event => 
        event._id === originalId ? updatedEvent : event
      );
      
      // Regenerate recurrences
      return generateRecurringEvents(updatedEvents.filter(e => !e.isRecurrence));
    });
  };

  // Fetch dữ liệu khi taskId hoặc refreshKey thay đổi
  useEffect(() => {
    console.log('TaskId or refreshKey changed, fetching events');
    fetchTaskEvents();
  }, [taskId, refreshKey, fetchTaskEvents]);

  return {
    taskEvents,
    loading,
    error,
    refreshTaskEvents,
    addEvent,
    removeEvent,
    updateEvent
  };
}; 