import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../../types/task/response/task.response';
import { isTaskNearDue, isTaskOverdue, getCountdownString } from '../../utils/date.utils';
import { BiBell } from 'react-icons/bi';
import { FiCheck, FiClock, FiAlertTriangle } from 'react-icons/fi';
import taskService from '../../services/task.service';
import { toast } from 'react-toastify';

interface NotificationBellProps {
  tasks: Task[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'near-due';
  timeInfo: string;
  task: Task;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ tasks }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for overdue and near-due tasks
  useEffect(() => {
    const overdueItems: NotificationItem[] = [];
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'completed') return;
      
      // Check for overdue tasks
      if (task.end_time && isTaskOverdue(task)) {
        // Calculate how much overdue
        const endTime = new Date(task.end_time);
        const overdueDuration = now.getTime() - endTime.getTime();
        const overdueDays = Math.floor(overdueDuration / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((overdueDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let overdueText = '';
        if (overdueDays > 0) {
          overdueText = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
        } else {
          overdueText = `${overdueHours} hour${overdueHours > 1 ? 's' : ''} overdue`;
        }
        
        overdueItems.push({
          id: task._id,
          title: task.title,
          message: 'This task is overdue!',
          type: 'overdue',
          timeInfo: overdueText,
          task: task
        });
      } 
      // Check for near-due tasks (75% through timeframe)
      else if (task.start_time && task.end_time && isTaskNearDue(task)) {
        // Get countdown string
        const timeInfo = getCountdownString(task.end_time);
        
        overdueItems.push({
          id: task._id,
          title: task.title,
          message: 'This task is due soon!',
          type: 'near-due',
          timeInfo: timeInfo,
          task: task
        });
      }
    });

    // Sort notifications: overdue first (most overdue at the top), then near-due (closest to deadline at the top)
    overdueItems.sort((a, b) => {
      // First sort by type (overdue before near-due)
      if (a.type === 'overdue' && b.type === 'near-due') return -1;
      if (a.type === 'near-due' && b.type === 'overdue') return 1;
      
      // Then sort by end_time
      const aEndTime = new Date(a.task.end_time || '').getTime();
      const bEndTime = new Date(b.task.end_time || '').getTime();
      
      if (a.type === 'overdue') {
        // For overdue tasks, most overdue (earliest end_time) first
        return aEndTime - bEndTime;
      } else {
        // For near-due tasks, closest to deadline (earliest end_time) first
        return aEndTime - bEndTime;
      }
    });

    setNotifications(overdueItems);
  }, [tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle marking a task as completed
  const handleMarkAsCompleted = async (taskId: string) => {
    try {
      await taskService.updateTask(taskId, { status: 'completed' });
      
      // Update local notifications list
      setNotifications(prev => prev.filter(notification => notification.id !== taskId));
      
      // Show success toast
      toast.success('Overdue task notification has been viewed!', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error marking task as completed:', error);
      toast.error('Failed to mark task as completed. Please try again.', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-blue-500 focus:outline-none"
        aria-label="Notifications"
      >
        <BiBell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Task Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                        notification.type === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="ml-3 w-full">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <button 
                            onClick={() => handleMarkAsCompleted(notification.id)}
                            className="ml-2 p-1 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100"
                            title="Mark as completed"
                          >
                            <FiCheck size={16} />
                          </button>
                        </div>
                        <p className={`text-sm ${
                          notification.type === 'overdue' 
                            ? 'text-red-500' 
                            : 'text-yellow-500'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          {notification.type === 'overdue' ? (
                            <FiAlertTriangle className="inline mr-1" />
                          ) : (
                            <FiClock className="inline mr-1" />
                          )}
                          {notification.timeInfo}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 