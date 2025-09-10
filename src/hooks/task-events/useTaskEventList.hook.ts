import { useState, useEffect, useCallback } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { taskEventService } from '../../services/task-event.service';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';

// Helper function to generate recurring events
const generateRecurringEvents = (events: TaskEvent[]): TaskEvent[] => {
  const allEvents: TaskEvent[] = [];
  
  events.forEach(event => {
    // Thêm event gốc
    allEvents.push(event);
    
    // Nếu event có repeat_type khác 'none', tạo các recurring instances ảo
    if (event.repeat_type && event.repeat_type !== 'none') {
      const recurringInstances = generateRecurringInstances(event);
      allEvents.push(...recurringInstances);
    }
  });
  
  return allEvents;
};

// Hàm tạo các recurring instances ảo từ event gốc
const generateRecurringInstances = (originalEvent: TaskEvent): TaskEvent[] => {
  const instances: TaskEvent[] = [];
  
  try {
    if (!originalEvent.repeat_type || originalEvent.repeat_type === 'none') {
      return instances;
    }
    
    // Lấy thông tin về sự kiện gốc
    const startDate = new Date(originalEvent.start_time);
    const endDate = originalEvent.end_time ? new Date(originalEvent.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000);
    const duration = endDate.getTime() - startDate.getTime();
    
    // Lấy các thông số lặp lại
    const repeatType = originalEvent.repeat_type;
    const repeatFrequency = originalEvent.repeat_frequency || 1;
    const repeatEndType = originalEvent.repeat_end_type || 'never';
    const repeatEndDate = originalEvent.repeat_end_date ? new Date(originalEvent.repeat_end_date) : null;
    const repeatOccurrences = originalEvent.repeat_occurrences || 10;
    
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;
    
    // Bỏ qua occurrence đầu tiên vì đã có event gốc
    switch (repeatType) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + repeatFrequency);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * repeatFrequency);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + repeatFrequency);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + repeatFrequency);
        break;
      case 'custom':
        if (originalEvent.repeat_unit === 'day') {
          currentDate.setDate(currentDate.getDate() + repeatFrequency);
        } else if (originalEvent.repeat_unit === 'week') {
          currentDate.setDate(currentDate.getDate() + 7 * repeatFrequency);
        } else if (originalEvent.repeat_unit === 'month') {
          currentDate.setMonth(currentDate.getMonth() + repeatFrequency);
        } else if (originalEvent.repeat_unit === 'year') {
          currentDate.setFullYear(currentDate.getFullYear() + repeatFrequency);
        }
        break;
    }
    
    // Tạo các recurring instances
    while (true) {
      // Kiểm tra điều kiện kết thúc
      if (repeatEndType === 'on' && repeatEndDate && currentDate > repeatEndDate) {
        break;
      }
      
      if (repeatEndType === 'after' && occurrenceCount >= repeatOccurrences) {
        break;
      }
      
      if (occurrenceCount > 100) {
        console.warn('Reached maximum number of recurring events (100), stopping');
        break;
      }
      
      // Tạo instance ảo
      const newStartDate = new Date(currentDate);
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      const recurringInstance: TaskEvent = {
        ...originalEvent,
        _id: `${originalEvent._id}_${occurrenceCount + 1}`, // ID ảo cho recurring instance
        start_time: newStartDate,
        end_time: newEndDate,
        isRecurrence: true, // Đánh dấu đây là recurring instance
        parent_event_id: originalEvent._id // Liên kết với event gốc
      };
      
      instances.push(recurringInstance);
      occurrenceCount++;
      
      // Tăng ngày cho lần lặp tiếp theo
      switch (repeatType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + repeatFrequency);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7 * repeatFrequency);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + repeatFrequency);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + repeatFrequency);
          break;
        case 'custom':
          if (originalEvent.repeat_unit === 'day') {
            currentDate.setDate(currentDate.getDate() + repeatFrequency);
          } else if (originalEvent.repeat_unit === 'week') {
            currentDate.setDate(currentDate.getDate() + 7 * repeatFrequency);
          } else if (originalEvent.repeat_unit === 'month') {
            currentDate.setMonth(currentDate.getMonth() + repeatFrequency);
          } else if (originalEvent.repeat_unit === 'year') {
            currentDate.setFullYear(currentDate.getFullYear() + repeatFrequency);
          }
          break;
      }
    }
  } catch (error) {
    console.error('Error generating recurring instances:', error);
  }
  
  return instances;
};

// Hàm createRecurringEvents đã được loại bỏ vì không còn cần thiết
// Các recurring events giờ được tạo ảo trên frontend thông qua generateRecurringInstances

// Hàm ước tính ngày kết thúc dựa trên số lần lặp lại
const estimateEndDateFromOccurrences = (startTime: Date, event: TaskEvent): Date => {
  const endDate = new Date(startTime);
  const occurrences = event.repeat_occurrences || 10;
  
  switch (event.repeat_type) {
    case 'daily': {
      const interval = event.repeat_interval || 1;
      endDate.setDate(endDate.getDate() + (interval * occurrences));
      break;
    }
    case 'weekly': {
      const interval = event.repeat_interval || 1;
      endDate.setDate(endDate.getDate() + (7 * interval * occurrences));
      break;
    }
    case 'monthly': {
      const interval = event.repeat_interval || 1;
      endDate.setMonth(endDate.getMonth() + (interval * occurrences));
      break;
    }
    case 'yearly': {
      const interval = event.repeat_interval || 1;
      endDate.setFullYear(endDate.getFullYear() + (interval * occurrences));
      break;
    }
    case 'custom': {
      // Giả định custom là theo tuần
      const interval = event.repeat_interval || 1;
      endDate.setDate(endDate.getDate() + (7 * interval * occurrences));
      break;
    }
    default:
      // Mặc định là 3 tháng
      endDate.setMonth(endDate.getMonth() + 3);
  }
  
  return endDate;
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
        
        // Không cần tạo các sự kiện lặp lại ảo nữa
        setTaskEvents(formattedEvents);
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

  // Thêm hàm thêm sự kiện mới vào state local và cơ sở dữ liệu
  const addEvent = async (event: TaskEvent) => {
    console.log('Adding event to local state and database:', event);
    
    try {
      // Đảm bảo task_id luôn có giá trị
      const eventToCreate: CreateTaskEventRequest = {
        ...event,
        task_id: event.task_id || taskId
      };
      
      // Tạo sự kiện trong database (chỉ tạo 1 event gốc, không tạo recurring instances)
      const response = await taskEventService.createTaskEvent(eventToCreate);
      if (response && response.data && response.data.data) {
        const createdEvent = response.data.data;
        
        // Thêm event vào state local
        setTaskEvents(prev => [...prev, createdEvent]);
        
        // Nếu là recurring event, các instances ảo sẽ được tạo tự động
        // thông qua generateRecurringEvents khi render
        console.log('Event created successfully:', createdEvent);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Thêm hàm xóa sự kiện khỏi state local và cơ sở dữ liệu
  const removeEvent = async (eventId: string) => {
    console.log('Removing event from local state and database:', eventId);
    
    try {
      // Xóa sự kiện khỏi cơ sở dữ liệu
      await taskEventService.deleteTaskEvent(eventId);
      
      // Xóa sự kiện khỏi state local
      setTaskEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Thêm hàm cập nhật sự kiện trong state local và cơ sở dữ liệu
  const updateEvent = async (eventId: string, updatedEvent: TaskEvent) => {
    console.log('Updating event in local state and database:', eventId, updatedEvent);
    
    try {
      // Chuẩn bị dữ liệu cập nhật
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
        location: updatedEvent.location,
        description: updatedEvent.description,
        guests: updatedEvent.guests,
        parent_event_id: updatedEvent.parent_event_id
      };
      
      // Cập nhật sự kiện trong cơ sở dữ liệu
      const response = await taskEventService.updateTaskEvent(eventId, eventToUpdate);
      
      if (response && response.data && response.data.data) {
        // Cập nhật state local
        setTaskEvents(prev => prev.map(event => 
          event._id === eventId ? response.data.data : event
        ));
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
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