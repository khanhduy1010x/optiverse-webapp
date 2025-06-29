import React from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';

interface TaskHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowPopup: (show: boolean) => void;
  showFilterMenu: boolean;
  setShowFilterMenu: (show: boolean) => void;
  showSortMenu: boolean;
  setShowSortMenu: (show: boolean) => void;
  showStatusFilterMenu: boolean;
  setShowStatusFilterMenu: (show: boolean) => void;
  filterTags: string[];
  filterStatus: ('pending' | 'completed' | 'overdue')[];
  allTags: Tag[];
  sortOrder: 'newest' | 'oldest' | 'deadline';
  handleFilterByTags: (tagIds: string[]) => void;
  handleFilterByStatus: (statuses: ('pending' | 'completed' | 'overdue')[]) => void;
  handleSortChange: (order: 'newest' | 'oldest' | 'deadline') => void;
  handleSearchChange: (query: string) => void;
  setShowTagManagement: (show: boolean) => void;
  onCheckOverdue?: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    setShowPopup,
    showFilterMenu,
    setShowFilterMenu,
    showSortMenu,
    setShowSortMenu,
    showStatusFilterMenu,
    setShowStatusFilterMenu,
    filterTags,
    filterStatus,
    allTags,
    sortOrder,
    handleFilterByTags,
    handleFilterByStatus,
    handleSortChange,
    handleSearchChange,
    setShowTagManagement,
    onCheckOverdue
}) => {
  const handleFilterTagClick = (tagId: string) => {
    const updatedFilterTags = filterTags.includes(tagId)
      ? filterTags.filter(id => id !== tagId)
      : [...filterTags, tagId];
    handleFilterByTags(updatedFilterTags);
  };

  const handleFilterStatusClick = (status: 'pending' | 'completed' | 'overdue') => {
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">My Tasks</h1>
          <div className={GROUP_CLASSNAMES.flexItemsCenter + " space-x-4"}>
            {onCheckOverdue && (
              <button
                onClick={onCheckOverdue}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm flex items-center font-medium shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                title="Manually check and update any tasks that have passed their due date"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check Overdue
              </button>
            )}
            <button
              onClick={() => setShowTagManagement(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Manage Tags
            </button>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              id="status-filter-button"
              onClick={() => {
                setShowStatusFilterMenu(!showStatusFilterMenu);
                setShowFilterMenu(false);
                setShowSortMenu(false);
              }}
              className={`flex items-center justify-center px-4 py-2 border ${
                filterStatus.length > 0 ? 'border-purple-500 text-purple-500' : 'border-gray-300 text-gray-700'
              } rounded-md bg-white hover:bg-gray-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status {filterStatus.length > 0 && `(${filterStatus.length})`}
            </button>

            {showStatusFilterMenu && (
              <div id="status-filter-menu" className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
                  <div className="space-y-2">
                    {['pending', 'completed', 'overdue'].map((status) => (
                      <div key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={filterStatus.includes(status as 'pending' | 'completed' | 'overdue')}
                          onChange={() => handleFilterStatusClick(status as 'pending' | 'completed' | 'overdue')}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`status-${status}`} className="ml-2 text-sm text-gray-700 flex items-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => handleFilterByStatus([])}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowStatusFilterMenu(false)}
                      className="text-sm bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <button
              id="filter-button"
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
                setShowStatusFilterMenu(false);
              }}
              className={`flex items-center justify-center px-4 py-2 border ${
                filterTags.length > 0 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-700'
              } rounded-md bg-white hover:bg-gray-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Tags {filterTags.length > 0 && `(${filterTags.length})`}
            </button>

            {showFilterMenu && (
              <div id="filter-menu" className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Tags</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allTags.length > 0 ? (
                      allTags.map((tag) => (
                        <div key={tag._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tag-${tag._id}`}
                            checked={filterTags.includes(tag._id)}
                            onChange={() => handleFilterTagClick(tag._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`tag-${tag._id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-1"
                              style={{ backgroundColor: tag.color }}
                            ></span>
                            {tag.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags available</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => handleFilterByTags([])}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="relative">
            <button
              id="sort-button"
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
                setShowStatusFilterMenu(false);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'Deadline'}
            </button>

            {showSortMenu && (
              <div id="sort-menu" className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="p-2">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                      sortOrder === 'newest' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                      sortOrder === 'oldest' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    onClick={() => handleSortChange('deadline')}
                    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                      sortOrder === 'deadline' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Deadline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskHeader; 