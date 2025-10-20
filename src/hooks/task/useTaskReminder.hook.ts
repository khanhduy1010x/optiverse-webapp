import { useEffect, useState, useRef } from 'react';
import { Task } from '../../types/task/response/task.response';
import notificationService from '../../services/notification.service';
import taskService from '../../services/task.service';

export const useTaskReminder = (tasks: Task[]) => {
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Hàm đánh dấu task là overdue và hiển thị thông báo
  const markTaskAsOverdue = async (task: Task) => {
    try {
      console.log(`Task "${task.title}" is overdue!`);
      
      // Cập nhật trạng thái task thành overdue
      await taskService.updateTask(task._id, { status: 'overdue' });
      
      // Gửi thông báo đến backend
      await notificationService.sendTaskOverdueNotification(task._id, task.title);
      
      // Đánh dấu task đã được kiểm tra
      setCheckedTasks(prev => ({
        ...prev,
        [task._id]: true
      }));
    } catch (error) {
      console.error(`Error handling overdue task ${task._id}:`, error);
    }
  };

  // Lên lịch chính xác cho các task sẽ trở thành overdue
  const scheduleTaskTimeouts = () => {
    // Xóa các timeout hiện có trước
    Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = {};
    
    const now = new Date();
    
    // Lên lịch timeout cho các task
    tasks.forEach(task => {
      // Bỏ qua các task đã hoàn thành, đã được đánh dấu là quá hạn, hoặc đã được kiểm tra
      if (task.status === 'completed' || task.status === 'overdue' || checkedTasks[task._id]) {
        return;
      }

      // Kiểm tra nếu task có deadline
      if (task.end_time) {
        const endTime = new Date(task.end_time);
        
        // Nếu đã quá hạn, đánh dấu ngay lập tức
        if (endTime < now) {
          markTaskAsOverdue(task);
          return;
        }
        
        // Tính toán số mili giây cho đến deadline
        const timeUntilDeadline = endTime.getTime() - now.getTime();
        
        // Chỉ đặt timeout nếu nó trong vòng 24 giờ tới (để tránh quá nhiều timeout)
        if (timeUntilDeadline <= 24 * 60 * 60 * 1000) {
          console.log(`Lên lịch task "${task.title}" sẽ được đánh dấu là quá hạn trong ${timeUntilDeadline}ms`);
          
          // Đặt timeout để đánh dấu là quá hạn chính xác khi đến deadline
          const timeoutId = setTimeout(() => {
            markTaskAsOverdue(task);
          }, timeUntilDeadline);
          
          // Lưu tham chiếu timeout
          timeoutRefs.current[task._id] = timeoutId;
        }
      }
    });
  };

  // Kiểm tra các task quá hạn và gửi thông báo (vẫn giữ lại để dự phòng)
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
          await markTaskAsOverdue(task);
        }
      }
    }
  };

  // Lên lịch chính xác khi danh sách tasks thay đổi
  useEffect(() => {
    scheduleTaskTimeouts();
    
    // Cũng chạy kiểm tra thông thường cho bất kỳ task nào có thể bị bỏ sót
    checkOverdueTasks();
    
    // Vẫn giữ interval làm dự phòng
    const intervalId = setInterval(() => {
      checkOverdueTasks();
    }, 60000); // 60000ms = 1 phút
    
    return () => {
      // Dọn dẹp tất cả timeout khi component unmount hoặc dependencies thay đổi
      clearInterval(intervalId);
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
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