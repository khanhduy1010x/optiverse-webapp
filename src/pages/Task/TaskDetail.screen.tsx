import React from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles';
import { TaskDetailProps } from '../../types/task/props/component.props';
import Modal from 'react-modal';
import { formatConsistentDateTime } from '../../utils/date.utils';

const TaskDetail: React.FC<TaskDetailProps> = ({
    selectedTask,
    taskTags,
    setShowTaskDetail,
    handleEditTask
}) => {
    if (!selectedTask) return null;

    return (
        <Modal isOpen={true}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >               <div className={GROUP_CLASSNAMES.taskModalContent}>
                {/* Task title */}
                <div className={GROUP_CLASSNAMES.taskDetailHeader}>
                    <h2 className="text-xl font-medium text-gray-900">
                        {selectedTask.title}
                    </h2>
                </div>

                {/* Description */}
                {selectedTask.description && (
                    <div className={GROUP_CLASSNAMES.taskDetailDescription}>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {selectedTask.description}
                        </p>
                    </div>
                )}

                <div className={GROUP_CLASSNAMES.taskDetailSection}>
                    <div className="space-y-2">
                        <div className="flex items-center py-2">
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-gray-700">Status:</div>
                            <span className={`ml-auto ${GROUP_CLASSNAMES.taskStatusBadge} ${selectedTask.status === 'completed' ? GROUP_CLASSNAMES.taskStatusCompleted :
                                selectedTask.status === 'overdue' ? GROUP_CLASSNAMES.taskStatusOverdue :
                                    GROUP_CLASSNAMES.taskStatusPending
                                }`}>
                                {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                            </span>
                        </div>

                        <div className="flex items-center py-2">
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            <div className="text-sm text-gray-700">Priority:</div>
                            <span className={`ml-auto ${GROUP_CLASSNAMES.taskStatusBadge} ${selectedTask.priority === 'high' ? GROUP_CLASSNAMES.taskPriorityHigh :
                                selectedTask.priority === 'medium' ? GROUP_CLASSNAMES.taskPriorityMedium :
                                    GROUP_CLASSNAMES.taskPriorityLow
                                }`}>
                                {selectedTask.priority === 'high' ? 'P1' :
                                    selectedTask.priority === 'medium' ? 'P2' : 'P3'}
                            </span>
                        </div>

                        {/* Start Time */}
                        {selectedTask.start_time && (
                            <div className="flex items-center py-2">
                                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="text-sm text-gray-700">Start:</div>
                                <span className="ml-auto text-sm text-gray-600">
                                    {formatConsistentDateTime(selectedTask.start_time)}
                                </span>
                            </div>
                        )}

                        {/* End Time */}
                        {selectedTask.end_time && (
                            <div className="flex items-center py-2">
                                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-gray-700">Due:</div>
                                <span className="ml-auto text-sm text-gray-600">
                                    {formatConsistentDateTime(selectedTask.end_time)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center py-2">
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-sm text-gray-700">Created:</div>
                            <span className="ml-auto text-sm text-gray-600">
                                {selectedTask.createdAt ? formatConsistentDateTime(selectedTask.createdAt) : 'Unknown date'}
                            </span>
                        </div>

                        <div className="flex items-center py-2">
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <div className="text-sm text-gray-700">Tags:</div>
                            <div className={GROUP_CLASSNAMES.tagContainer}>
                                {taskTags[selectedTask._id] && taskTags[selectedTask._id].length > 0 ? (
                                    taskTags[selectedTask._id].map((tag) => (
                                        <span
                                            key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                                            className={GROUP_CLASSNAMES.tagItem}
                                            style={{
                                                backgroundColor: tag.color ? `${tag.color}15` : '#e5e7eb15',
                                                color: tag.color || '#6b7280'
                                            }}
                                        >
                                            {tag.name || 'Unnamed Tag'}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">No tags</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom buttons */}
                <div className={GROUP_CLASSNAMES.taskDetailFooter}>
                    <button
                        onClick={() => setShowTaskDetail(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => handleEditTask(selectedTask)}
                        className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                        Edit
                    </button>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={() => setShowTaskDetail(false)}
                    className={GROUP_CLASSNAMES.taskModalCloseButton}
                    aria-label="Close task details"
                    title="Close task details"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </Modal>
    );
};

export default TaskDetail; 