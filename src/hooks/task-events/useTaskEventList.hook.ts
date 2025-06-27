import { useState, useEffect, useCallback } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { taskEventService } from '../../services/task-event.service';

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

  // Thêm hàm thêm sự kiện mới vào state local
  const addEvent = (event: TaskEvent) => {
    console.log('Adding event to local state:', event);
    setTaskEvents(prev => [...prev, event]);
  };

  // Thêm hàm xóa sự kiện khỏi state local
  const removeEvent = (eventId: string) => {
    console.log('Removing event from local state:', eventId);
    setTaskEvents(prev => prev.filter(event => event._id !== eventId));
  };

  // Thêm hàm cập nhật sự kiện trong state local
  const updateEvent = (eventId: string, updatedEvent: TaskEvent) => {
    console.log('Updating event in local state:', eventId, updatedEvent);
    setTaskEvents(prev => 
      prev.map(event => event._id === eventId ? updatedEvent : event)
    );
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