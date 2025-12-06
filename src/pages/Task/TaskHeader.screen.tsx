import React from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { TaskStatusTab } from './Task.page';
import NotificationBell from '../../components/task/NotificationBell.component';
import { Task } from '../../types/task/response/task.response';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { ImportDropdown } from '../../components/common/ImportDropdown.component';

interface TaskHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowPopup: (show: boolean) => void;
  filterTags: string[];
  filterStatus: ('pending' | 'completed' | 'overdue')[];
  allTags: Tag[];
  sortOrder: 'newest' | 'oldest' | 'deadline';
  handleFilterByTags: (tagIds: string[]) => void;
  handleFilterByStatus: (
    statuses: ('pending' | 'completed' | 'overdue')[]
  ) => void;
  handleSortChange: (order: 'newest' | 'oldest' | 'deadline') => void;
  handleSearchChange: (query: string) => void;
  setShowTagManagement: (show: boolean) => void;
  onCheckOverdue?: () => void;
  activeTab: TaskStatusTab;
  handleTabChange: (tab: TaskStatusTab) => void;
  taskCounts: {
    all: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  tasks: Task[]; // Add tasks prop for NotificationBell
  onOpenTaskImport?: () => void;
  onDownloadTaskTemplate?: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  setShowPopup,
  filterTags,
  filterStatus,
  allTags,
  sortOrder,
  handleFilterByTags,
  handleFilterByStatus,
  handleSortChange,
  handleSearchChange,
  setShowTagManagement,
  onCheckOverdue,
  activeTab,
  handleTabChange,
  taskCounts,
  tasks,
  onOpenTaskImport,
  onDownloadTaskTemplate,
}) => {
  const { t } = useAppTranslate('task');
  const handleFilterTagClick = (tagId: string) => {
    const updatedFilterTags = filterTags.includes(tagId)
      ? filterTags.filter(id => id !== tagId)
      : [...filterTags, tagId];
    handleFilterByTags(updatedFilterTags);
  };

  const handleFilterStatusClick = (
    status: 'pending' | 'completed' | 'overdue'
  ) => {
    const updatedFilterStatus = filterStatus.includes(status)
      ? filterStatus.filter(s => s !== status)
      : [...filterStatus, status];
    handleFilterByStatus(updatedFilterStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-6 sticky top-0 bg-white z-10 pt-6 pb-4 px-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {t('my_tasks')}
          </h1>
          <div className={GROUP_CLASSNAMES.flexItemsCenter + ' space-x-4'}>
            {/* Add NotificationBell component */}
            <NotificationBell tasks={tasks} />

            {/* Import Dropdown */}
            <ImportDropdown
              onDownloadTemplate={onDownloadTaskTemplate}
              onOpenImport={onOpenTaskImport}
              type="task"
              className=""
            />

            <button
              onClick={() => setShowTagManagement(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {t('manage_tags')}
            </button>
            {/* Removed inline Add Task button in favor of global CircleButton FAB */}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-nowrap mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={t('search_tasks_placeholder')}
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              title={t('search')}
              aria-label={t('search')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Tag Filter */}
          <div className="relative group">
            <button
              id="filter-button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {t('tags')} {filterTags.length > 0 && t('tags_with_count', { count: filterTags.length })}
            </button>

            <div
              id="filter-menu"
              className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block"
            >
              <div className="p-4">
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  {t('filter_by_tags')}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allTags.length > 0 ? (
                    allTags.map(tag => (
                      <button
                        key={tag._id}
                        onClick={() => handleFilterTagClick(tag._id)}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-md ${filterTags.includes(tag._id)
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <span className="flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          {tag.name}
                          {filterTags.includes(tag._id) && (
                            <span className="ml-2">✓</span>
                          )}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t('no_tags_available')}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => handleFilterByTags([])}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {t('clear_all')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="relative group">
            <button
              id="sort-button"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              {t('sort_label')}{' '}
              {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
            </button>

            <div
              id="sort-menu"
              className="absolute right-0 z-10 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block"
            >
              <div className="p-4">
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  {t('sort_by')}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${sortOrder === 'newest'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {t('newest_first')}
                    {sortOrder === 'newest' && <span className="ml-2">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${sortOrder === 'oldest'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {t('oldest_first')}
                    {sortOrder === 'oldest' && <span className="ml-2">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSortChange('deadline')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${sortOrder === 'deadline'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {t('deadline_soonest_first')}
                    {sortOrder === 'deadline' && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Di chuyển xuống dưới thanh tìm kiếm */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 ${activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => handleTabChange('pending')}
          >
            {t('pending')}
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {taskCounts.pending}
            </span>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 ${activeTab === 'completed'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => handleTabChange('completed')}
          >
            {t('completed')}
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
              {taskCounts.completed}
            </span>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 ${activeTab === 'overdue'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => handleTabChange('overdue')}
          >
            {t('overdue')}
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
              {taskCounts.overdue}
            </span>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            onClick={() => handleTabChange('all')}
          >
            {t('all')}
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
              {taskCounts.all}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskHeader;
