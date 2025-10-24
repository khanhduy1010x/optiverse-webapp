import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../../types/task/response/task.response';
import { isTaskNearDue, isTaskOverdue, getCountdownString } from '../../utils/date.utils';
import { BiBell } from 'react-icons/bi';
import { FiCheck, FiClock, FiAlertTriangle, FiX } from 'react-icons/fi';
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
  const [removedNotifications, setRemovedNotifications] = useState<Set<string>>(new Set());
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [undoTimer, setUndoTimer] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for overdue and near-due tasks
  useEffect(() => {
    const overdueItems: NotificationItem[] = [];
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'completed') return;
      
      // Skip if this notification was already dismissed
      if (dismissedNotifications.has(task._id)) return;
      
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
  }, [tasks, dismissedNotifications]);

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
      
      // Mark as removed
      const newRemoved = new Set(removedNotifications);
      newRemoved.add(taskId);
      setRemovedNotifications(newRemoved);
      
      // Update local notifications list
      setNotifications(prev => prev.filter(notification => notification.id !== taskId));
      
      // Show success toast with undo
      toast.success('Task completed!', {
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

  // Handle dismissing all notifications without completing tasks
  const handleDismissAll = () => {
    if (notifications.length === 0) return;
    
    // Add all current notifications to dismissed set
    const newDismissed = new Set(dismissedNotifications);
    notifications.forEach(notification => {
      newDismissed.add(notification.id);
    });
    setDismissedNotifications(newDismissed);
    
    // Clear notifications from display
    setNotifications([]);
    
    // Show info toast
    toast.info(`${notifications.length} notifications dismissed!`, {
      position: "top-right",
      autoClose: 2000
    });
  };

  // Handle dismissing notification without completing
  const handleDismiss = (taskId: string) => {
    // Add to dismissed set so it won't show again
    const newDismissed = new Set(dismissedNotifications);
    newDismissed.add(taskId);
    setDismissedNotifications(newDismissed);
    
    // Remove from current notifications display
    setNotifications(prev => prev.filter(notification => notification.id !== taskId));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors duration-200 focus:outline-none hover:bg-gray-100 rounded-full"
        aria-label="Notifications"
      >
        <BiBell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full shadow-lg">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
        >
          {/* Apple-style Header */}
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Task Reminders</h3>
                <p className="text-xs text-gray-500 mt-0.5">{notifications.length} overdue</p>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Close notifications"
              >
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 last:border-b-0 group"
                  >
                    <div className="flex gap-4">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0 pt-1">
                        <div
                          className={`w-3 h-3 rounded-full mt-1 shadow-sm ${
                            notification.type === 'overdue'
                              ? 'bg-red-600'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleMarkAsCompleted(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Complete task"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={() => handleDismiss(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-200 rounded-lg transition-all duration-200"
                              title="Dismiss"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>

                        <p
                          className={`text-xs mt-1.5 font-bold ${
                            notification.type === 'overdue'
                              ? 'text-red-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          {notification.type === 'overdue' ? (
                            <FiAlertTriangle size={14} className="text-red-600" />
                          ) : (
                            <FiClock size={14} className="text-amber-600" />
                          )}
                          <span>{notification.timeInfo}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
                  <BiBell className="text-gray-400" size={20} />
                </div>
                <p className="text-gray-500 text-xs font-medium">All caught up!</p>
                <p className="text-gray-400 text-xs mt-0.5">No pending tasks</p>
              </div>
            )}
          </div>

          {/* Dismiss All Button */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleDismissAll}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FiX size={16} />
                Dismiss All ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 