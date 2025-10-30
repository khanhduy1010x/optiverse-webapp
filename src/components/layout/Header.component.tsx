import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from '../common/Icon/Icon.component';
import Button from '../common/Button.component';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import NotificationPopover from './NotificationPopover';
import UserMenuPopover from './UserMenuPopover';
import WorkspaceSelector from '../workspace/WorkspaceSelector';
import OPScore from '../common/OPScore.component';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifHideTimer = useRef<number | null>(null);
    const userHideTimer = useRef<number | null>(null);
    const { logout } = useAuthStatus();

    // Get user data from Redux store
    const user = useSelector((state: RootState) => state.auth.user);

    // Get user initials for avatar fallback
    const getUserInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="sticky top-0 z-50 bg-black border-b border-gray-400 ">
            <div className="h-14 flex items-center ml-2 pr-4 md:pr-6 gap-4">

                {/* Left: Workspace Selector */}
                <WorkspaceSelector />

                {/* Center: Marketplace Button */}
                <Button
                    inverted
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                >
                    {/* Fallback to a supported icon for marketplace */}
                    <span className="hidden sm:inline">Marketplace</span>
                </Button>

                {/* Right: Notification, OP Score, User Name & Avatar */}
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

                    {/* OP Score */}
                    <OPScore className="hidden sm:flex" />

                    {/* User Name (hidden on small screens) */}
                    {user?.full_name && (
                        <span className="hidden md:inline-block text-sm font-medium text-gray-200 max-w-32 truncate">
                            {user.full_name}
                        </span>
                    )}

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
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-md transition-shadow overflow-hidden"
                            aria-label="User menu"
                        >
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name || 'User avatar'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getUserInitials(user?.full_name)
                            )}
                        </button>

                        {showUserMenu && (
                            <UserMenuPopover
                                name={user?.full_name || 'Unknown User'}
                                email={user?.email || 'No email'}
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