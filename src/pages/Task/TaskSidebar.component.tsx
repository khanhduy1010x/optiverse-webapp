import React from 'react';
import View from '../../components/common/View.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import Icon from '../../components/common/Icon/Icon.component';
import { IconName } from '../../assets/icons';

interface TaskSidebarProps {
    selectedMenu: string;
    handleNavigate: (menu: string, path: string) => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ selectedMenu, handleNavigate }) => {
    const menuItems = [
        { id: 'task', label: 'Task', path: '/task', icon: 'task' as IconName },
        { id: 'task-event', label: 'Schedule', path: '/task-event', icon: 'calendar' as IconName },
    ];

    return (
        <View className="w-64 border-r border-gray-200">
            <div className="h-full flex flex-col">
                {/* Header section */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Task Menu</h2>
                    <p className="text-sm text-gray-500 mt-1">Task Management</p>
                </div>

                {/* Navigation items - Centered with proper spacing */}
                <div className="flex-1 flex flex-col pt-10 px-6 space-y-4">
                    {menuItems.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => handleNavigate(menu.id, menu.path)}
                            className={`
                px-6 py-3 rounded-lg text-left cursor-pointer transition-all duration-200 flex items-center
                ${selectedMenu === menu.id
                                    ? 'bg-[#e7f6f7] text-[#21b4ca]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }
              `}
                        >
                            <Icon
                                name={menu.icon}
                                size={18}
                                className={`mr-3 ${selectedMenu === menu.id ? 'text-[#21b4ca]' : 'text-gray-500'}`}
                            />
                            <span className="font-medium text-sm">
                                {menu.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer section */}
                <div className="p-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                        Task Management
                    </div>
                </div>
            </div>
        </View>
    );
};

export default TaskSidebar; 