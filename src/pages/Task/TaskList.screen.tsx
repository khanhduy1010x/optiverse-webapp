import React, { useEffect, useState, useMemo } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles';
import { TaskListProps as TaskListComponentProps } from '../../types/task/props/component.props';
import {
  formatConsistentDateTime,
  getCountdownString,
  isTaskOverdue,
} from '../../utils/date.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import PaginationComponent from '../../components/common/Pagination.component';
import TagItem from '../../components/tags/TagItem.component';

const ITEMS_PER_PAGE = 10;

/**
 * TaskList Component - Danh sách task với phân trang
 * 
 * 📋 Pagination Flow:
 * 1. User sees max 10 tasks per page
 * 2. Pagination controls at bottom for navigation
 * 3. Auto-reset to page 1 when filter/search changes
 * 4. Smooth scroll to top when changing pages
 * 
 * Example with 35 tasks:
 * - Total pages: 4
 * - Page 1: items 1-10
 * - Page 2: items 11-20
 * - Page 3: items 21-30
 * - Page 4: items 31-35
 */
const TaskList: React.FC<TaskListComponentProps> = ({
  filteredTasks,
  taskTags,
  handleTaskClick,
  handleTaskUpdate,
  confirmDeleteTask,
  handleEditTask,
  loading,
  setShowPopup,
  searchQuery,
  filterTags,
}) => {
  const { t } = useAppTranslate();
  // State để lưu trữ thời gian đếm ngược cho mỗi task
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  // State cho phân trang - Track trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  // Kiểm tra và cập nhật task overdue
  const checkAndUpdateOverdueTasks = () => {
    const now = new Date();
    console.log('Check task overdue');
    filteredTasks.forEach(task => {
      // Chỉ kiểm tra task đang ở trạng thái pending
      if (task.status === 'pending' && task.end_time) {
        // Kiểm tra xem task đã quá hạn chưa
        if (isTaskOverdue(task.end_time, task.status)) {
          console.log(
            `Task "${task.title}" (${task._id}) đã quá hạn, cập nhật trạng thái thành overdue`
          );
          // Cập nhật trạng thái task thành overdue, thêm xử lý lỗi
          try {
            handleTaskUpdate(task._id, { status: 'overdue' });
          } catch (error) {
            console.error(
              `Lỗi khi cập nhật trạng thái task ${task._id} thành overdue:`,
              error
            );
            // Không hiển thị alert vì có thể gây phiền nhiễu nếu có nhiều task quá hạn cùng lúc
          }
        }
      }
    });
  };

  // Reset page khi filteredTasks thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTasks, searchQuery, filterTags]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredTasks.length);
  const paginatedTasks = useMemo(
    () => filteredTasks.slice(startIndex, endIndex),
    [filteredTasks, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Cập nhật thời gian đếm ngược mỗi giây
  useEffect(() => {
    console.log(
      'TaskList useEffect for countdowns triggered with',
      filteredTasks.length,
      'tasks'
    );

    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};

      filteredTasks.forEach(task => {
        // Skip completed tasks, but include pending and overdue tasks
        if (task.status === 'completed') {
          return;
        }

        // Log for debugging - this helps see if tasks with end times are being processed
        if (task.end_time) {
          console.log(
            `Processing countdown for task: ${task._id} - ${task.title}`,
            {
              status: task.status,
              end_time: task.end_time,
              hasEndTime: !!task.end_time,
            }
          );

          // Calculate countdown for any task with end_time that's not completed
          const countdown = getCountdownString(task.end_time);
          newCountdowns[task._id] = countdown;

          // Debug if countdown string is empty for a task with end_time
          if (!countdown) {
            console.warn(`Empty countdown returned for task with end_time:`, {
              taskId: task._id,
              title: task.title,
              end_time: task.end_time,
            });
          }
        }
      });

      // Debug total countdowns
      console.log(
        `Updated countdowns for ${Object.keys(newCountdowns).length} tasks`
      );

      setCountdowns(newCountdowns);

      // Kiểm tra và cập nhật các task quá hạn
      checkAndUpdateOverdueTasks();
    };

    // Cập nhật ngay lập tức
    updateCountdowns();

    // Cập nhật mỗi giây
    const intervalId = setInterval(updateCountdowns, 5000); // Update every 5 seconds instead of 10

    return () => clearInterval(intervalId);
  }, [filteredTasks]);

  // Kiểm tra task quá hạn khi component mount hoặc filteredTasks thay đổi
  useEffect(() => {
    checkAndUpdateOverdueTasks();
  }, [filteredTasks]);

  if (loading) {
    return (
      <div className={GROUP_CLASSNAMES.flexCenterCenter + ' py-12'}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className={GROUP_CLASSNAMES.taskEmptyState}>
        <svg
          className={GROUP_CLASSNAMES.taskEmptyIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <h3 className={GROUP_CLASSNAMES.taskEmptyTitle}>
          {t('no_tasks_found')}
        </h3>
        <p className={GROUP_CLASSNAMES.taskEmptyDescription}>
          {searchQuery || filterTags.length > 0
            ? t('no_tasks_match_search_filter')
            : t('get_started_create_task')}
        </p>
        <div className={GROUP_CLASSNAMES.taskEmptyAction}>
          {/* Removed inline Add a task button in favor of global CircleButton FAB */}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ul className="divide-y divide-gray-100 max-w-6x px-6 py-6">
        {paginatedTasks.map(task => (
          <li
            key={task._id}
            className={GROUP_CLASSNAMES.taskListItem}
            onClick={() => handleTaskClick(task)}
          >
            <div className={GROUP_CLASSNAMES.flexItemsCenter + ' items-start'}>
              <div
                className={`${GROUP_CLASSNAMES.taskCheckbox} ${
                  task.status === 'completed'
                    ? GROUP_CLASSNAMES.taskCheckboxCompleted
                    : task.status === 'overdue'
                      ? GROUP_CLASSNAMES.taskCheckboxOverdue
                      : GROUP_CLASSNAMES.taskCheckboxPending
                }`}
                onClick={e => {
                  e.stopPropagation();
                  handleTaskUpdate(task._id, {
                    status: task.status === 'completed' ? 'pending' : 'completed',
                  });
                }}
              >
                {task.status === 'completed' && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className={GROUP_CLASSNAMES.flexJustifyBetween}>
                  <p
                    className={`${GROUP_CLASSNAMES.taskTitle} ${
                      task.status === 'completed'
                        ? GROUP_CLASSNAMES.taskTitleCompleted
                        : task.status === 'overdue'
                          ? 'text-red-500 font-medium' // Màu đỏ cho task overdue
                          : GROUP_CLASSNAMES.taskTitlePending
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span
                      className={`${GROUP_CLASSNAMES.taskPriorityBadge} ${
                        task.priority === 'high'
                          ? GROUP_CLASSNAMES.taskPriorityHigh
                          : task.priority === 'medium'
                            ? GROUP_CLASSNAMES.taskPriorityMedium
                            : GROUP_CLASSNAMES.taskPriorityLow
                      }`}
                    >
                      {task.priority === 'high'
                        ? 'P1'
                        : task.priority === 'medium'
                          ? 'P2'
                          : 'P3'}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className={GROUP_CLASSNAMES.taskDescription}>
                    {task.description}
                  </p>
                )}

                {/* Task Tags and Countdown */}
                <div className="mt-2 space-y-2">
                  {/* Hiển thị thời gian đếm ngược cho tasks với end_time, không hiển thị cho task overdue */}
                  {task.end_time &&
                    task.status !== 'completed' &&
                    task.status !== 'overdue' && (
                      <div className="text-xs flex items-center">
                        <svg
                          className="w-3 h-3 mr-1 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-amber-500 font-medium">
                          {countdowns[task._id] ||
                            formatConsistentDateTime(task.end_time)}
                        </span>
                      </div>
                    )}

                  <div className={GROUP_CLASSNAMES.taskTagContainer}>
                    <div className={GROUP_CLASSNAMES.tagContainer}>
                      {taskTags[task._id] && taskTags[task._id].length > 0 ? (
                        taskTags[task._id].map(tag => (
                          <TagItem
                            key={
                              tag._id ||
                              `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`
                            }
                            tag={tag}
                            className={GROUP_CLASSNAMES.tagItem}
                          />
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-gray-500">
                      {task.createdAt
                        ? formatConsistentDateTime(task.createdAt).split(',')[0]
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex-shrink-0 invisible group-hover:visible flex">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleEditTask(task);
                  }}
                  className={GROUP_CLASSNAMES.taskActionButton}
                  title={t('edit_task')}
                  aria-label={t('edit_task')}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    confirmDeleteTask(task._id);
                  }}
                  className={GROUP_CLASSNAMES.taskDeleteButton}
                  title={t('delete_task')}
                  aria-label={t('delete_task')}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination Component */}
      {filteredTasks.length > 0 && (
        <div className="border-t border-gray-200 pb-20">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            canGoNext={currentPage < totalPages}
            canGoPrev={currentPage > 1}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredTasks.length}
            onNextPage={() => handlePageChange(currentPage + 1)}
            onPrevPage={() => handlePageChange(currentPage - 1)}
            onGoToPage={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TaskList;
