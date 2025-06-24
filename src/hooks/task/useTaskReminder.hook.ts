import { useEffect, useState } from 'react';
import { Task } from '../../types/task/response/task.response';
import notificationService from '../../services/notification.service';
import taskService from '../../services/task.service';

export const useTaskReminder = (tasks: Task[]) => {
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Kiểm tra các task quá hạn và gửi thông báo
  const checkOverdueTasks = async () => {
    const now = new Date();
    
    for (const task of tasks) {
      // Bỏ qua các task đã hoàn thành hoặc đã được đánh dấu là quá hạn
      if (task.status === 'completed' || task.status === 'overdue') {
        continue;
      }

      // Bỏ qua các task đã được kiểm tra
      if (checkedTasks[task._id]) {
        continue;
      }

      // Kiểm tra nếu task có deadline và đã quá hạn
      if (task.end_time) {
        const endTime = new Date(task.end_time);
        
        if (endTime < now) {
          console.log(`Task "${task.title}" is overdue!`);
          
          // Cập nhật trạng thái task thành overdue
          try {
            await taskService.updateTask(task._id, { status: 'overdue' });
            
            // Gửi thông báo
            await notificationService.sendTaskOverdueNotification(task._id, task.title);
            
            // Đánh dấu task đã được kiểm tra
            setCheckedTasks(prev => ({
              ...prev,
              [task._id]: true
            }));
          } catch (error) {
            console.error(`Error handling overdue task ${task._id}:`, error);
          }
        }
      }
    }
  };

  // Kiểm tra các task quá hạn khi danh sách tasks thay đổi
  useEffect(() => {
    checkOverdueTasks();
    
    // Thiết lập interval để kiểm tra định kỳ (mỗi phút)
    const intervalId = setInterval(() => {
      checkOverdueTasks();
    }, 60000); // 60000ms = 1 phút
    
    return () => {
      clearInterval(intervalId);
    };
  }, [tasks]);

  // Reset danh sách đã kiểm tra khi tasks thay đổi
  useEffect(() => {
    setCheckedTasks({});
  }, [tasks.length]);

  return {
    checkOverdueTasks
  };
};

export default useTaskReminder; 