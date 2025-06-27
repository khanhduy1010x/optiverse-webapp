import React, { useState, useEffect } from 'react';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { Calendar } from '../../components/task-event/Calendar.component';
import taskService from '../../services/task.service';

const Schedule: React.FC = () => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState<boolean>(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch first task from API to get a real taskId
  useEffect(() => {
    const fetchFirstTask = async () => {
      try {
        console.log('Fetching tasks from API...');
        setLoadingTask(true);
        setTaskError(null);
        
        const tasks = await taskService.fetchAllUserTasks();
        console.log('Tasks fetched:', tasks);
        
        if (tasks && tasks.length > 0) {
          console.log('Setting taskId to:', tasks[0]._id);
          setTaskId(tasks[0]._id);
        } else {
          console.log('No tasks found');
          setTaskId(null);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTaskError('Failed to load tasks. Please try again later.');
      } finally {
        setLoadingTask(false);
      }
    };

    fetchFirstTask();
  }, []);

  const { 
    taskEvents, 
    loading, 
    error, 
    refreshTaskEvents, 
    addEvent, 
    removeEvent, 
    updateEvent 
  } = useTaskEventList(taskId || '');

  // Tự động refresh dữ liệu sau mỗi 30 giây
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing task events');
      setRefreshTrigger(prev => prev + 1);
    }, 30000); // 30 giây

    return () => clearInterval(intervalId);
  }, []);

  // Refresh dữ liệu khi refreshTrigger thay đổi
  useEffect(() => {
    if (taskId && refreshTrigger > 0) {
      console.log('Refresh triggered by timer');
      refreshTaskEvents();
    }
  }, [refreshTrigger, taskId, refreshTaskEvents]);

  // Xử lý refresh thủ công
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refreshTaskEvents();
  };

  // Hiển thị loading spinner khi đang tải tasks
  if (loadingTask) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (taskError) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center p-6 max-w-sm mx-auto">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{taskError}</p>
          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có task nào
  if (!taskId) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center p-6 max-w-sm mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a task first to view and manage schedules.
          </p>
          <div className="mt-6">
            <a href="/task" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create a task
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleManualRefresh}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <Calendar
        taskId={taskId}
        taskEvents={taskEvents}
        loading={loading}
        error={error}
        addEvent={addEvent}
        removeEvent={removeEvent}
        updateEvent={updateEvent}
        refreshTaskEvents={refreshTaskEvents}
      />
    </div>
  );
};

export default Schedule; 