import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon/Icon.component';
import Button from '../common/Button.component';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import NotificationPopover from './NotificationPopover';
import UserMenuPopover from './UserMenuPopover';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [selectedWorkspace, setSelectedWorkspace] = useState('Home');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifHideTimer = useRef<number | null>(null);
    const userHideTimer = useRef<number | null>(null);
    const { logout } = useAuthStatus();

    const workspaces = [
        { id: 'home', name: 'Home' },
        { id: 'main', name: 'Main Workspace' },
        { id: 'personal', name: 'Personal Projects' },
        { id: 'team', name: 'Team Collaboration' },
        { id: 'archive', name: 'Archive' }
    ];

    return (
        <div className="sticky top-0 z-20 bg-black border-b border-gray-400 ">
            <div className="h-14 flex items-center ml-2 pr-4 md:pr-6 gap-4">

                {/* Left: Workspace Dropdown */}
                {/* Home quick button */}
                <button
                    onClick={() => { setSelectedWorkspace('Home'); navigate('/dashboard'); }}
                    className="flex items-center justify-center rounded-md border border-gray-200 text-white hover:bg-gray-50 hover:text-gray-800 transition-colors w-12 h-9"
                    aria-label="Go home"
                    title="Home"
                >
                    <Icon name="home" size={16} />
                </button>

                {/* Workspace Dropdown */}
                <div className="relative ml-2">
                    <Button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-around  px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                    >
                        {/* Use an existing icon name */}
                        <span className="hidden sm:inline">{selectedWorkspace}</span>
                        <Icon
                            name="chevronDown"
                            color='white'
                            size={12}
                            className={`transition-transform ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </Button>

                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                                {workspaces.map(workspace => (
                                    <button
                                        key={workspace.id}
                                        onClick={() => {
                                            setSelectedWorkspace(workspace.name);
                                            setIsDropdownOpen(false);
                                            if (workspace.id === 'home') {
                                                navigate('/dashboard');
                                            } else {
                                                navigate(`/workspace/${workspace.id}/dashboard`);
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedWorkspace === workspace.name ? 'text-gray-900 font-medium' : 'text-gray-600'
                                            }`}
                                    >
                                        {workspace.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Center: Marketplace Button */}
                <Button
                    inverted
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                >
                    {/* Fallback to a supported icon for marketplace */}
                    <span className="hidden sm:inline">Marketplace</span>
                </Button>

                {/* Right: Notification & Avatar */}
                <div className="ml-auto flex items-center gap-3">
                    {/* Notification Button with hover popover */}
                    <div
                        className="relative"
                        onMouseEnter={() => {
                            if (notifHideTimer.current) window.clearTimeout(notifHideTimer.current);
                            setShowNotif(true);
                        }}
                        onMouseLeave={() => {
                            notifHideTimer.current = window.setTimeout(() => setShowNotif(false), 120);
                        }}
                    >
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                            aria-label="Notifications"
                        >
                            <Icon name="notification" size={20} className="text-gray-200" />
                            <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </button>

                        {showNotif && (
                            <NotificationPopover
                                onViewAll={() => navigate('/notifications')}
                                onMarkAllRead={() => {/* TODO: wire action */ }}
                            />
                        )}
                    </div>

                    {/* Avatar with hover menu */}
                    <div
                        className="relative"
                        onMouseEnter={() => {
                            if (userHideTimer.current) window.clearTimeout(userHideTimer.current);
                            setShowUserMenu(true);
                        }}
                        onMouseLeave={() => {
                            userHideTimer.current = window.setTimeout(() => setShowUserMenu(false), 120);
                        }}
                    >
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-md transition-shadow"
                            aria-label="User menu"
                        >
                            JD
                        </button>

                        {showUserMenu && (
                            <UserMenuPopover
                                name="John Doe"
                                email="john@example.com"
                                onProfile={() => navigate('/user-profile')}
                                onNotifications={() => navigate('/notifications')}
                                onLogout={() => { logout(); navigate('/login'); }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;