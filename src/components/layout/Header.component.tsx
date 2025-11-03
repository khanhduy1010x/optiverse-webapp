import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from '../common/Icon/Icon.component';
import Button from '../common/Button.component';
import { useAuthStatus } from '../../hooks/auth/useAuthStatus.hook';
import { useAppTranslate } from '../../hooks/useAppTranslate';
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
    const { t } = useAppTranslate('common');

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

    // Get membership badge style based on package type
    const getMembershipBadgeStyle = (packageName?: string) => {
        switch (packageName?.toLowerCase()) {
            case 'free':
                return 'text-gray-300 bg-gray-600 bg-opacity-20';
            case 'basic':
                return 'text-amber-400 bg-amber-500/20 border border-amber-400/30';

            case 'plus':
                return 'text-emerald-400 bg-emerald-600/20 border border-emerald-400/30';

            case 'business':
                return 'text-sky-300 bg-sky-500/15 border border-sky-300/25';

            default:
                return 'text-blue-400 bg-blue-500 bg-opacity-10';
        }
    };

    // Get membership badge icon name based on package type
    const getMembershipIconName = (packageName?: string): string => {
        switch (packageName?.toLowerCase()) {
            case 'free':
                return 'level_free';
            case 'basic':
                return 'level_0';
            case 'plus':
                return 'level_1';
            case 'business':
                return 'level_2';
            default:
                return 'star';
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-400 ">
            <div className="h-14 flex items-center ml-2 pr-4 md:pr-6 gap-4">

                {/* Left: Workspace Selector */}
                <WorkspaceSelector />

                {/* Center: Navigation Buttons */}
                <div className="flex items-center gap-2">
                    {/* Membership Button */}
                    <Button
                        inverted
                        onClick={() => navigate('/membership')}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                    >
                        <span className="hidden sm:inline">Membership</span>
                    </Button>

                    {/* Marketplace Button */}
                    <Button
                        inverted
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                    >
                        {/* Fallback to a supported icon for marketplace */}
                        <span className="hidden sm:inline">Marketplace</span>
                    </Button>
                </div>

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

                    {/* OP Score with Info Tooltip */}
                    <div className="hidden sm:flex items-center gap-2 group relative">
                        <OPScore className="hidden sm:flex" />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-600 hover:text-gray-100 transition-colors relative group"
                        >
                            ?
                            <div className="absolute top-full left-1/2 w-72 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-white/95 backdrop-blur-xl text-gray-700 text-xs px-4 py-3 rounded-lg z-50 shadow-xl border border-gray-200 space-y-3">
                                {/* Q1 */}
                                <div>
                                    <p className="font-semibold text-left text-gray-900 mb-1">{t('op_faq_what')}</p>
                                    <p className="text-gray-600 text-left leading-relaxed">{t('op_faq_what_answer')}</p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Q2 */}
                                <div>
                                    <p className="font-semibold text-left text-gray-900 mb-1">{t('op_faq_how')}</p>
                                    <p className="text-gray-600 text-left leading-relaxed">{t('op_faq_how_answer')}</p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200"></div>

                                {/* Q3 */}
                                <div>
                                    <p className="font-semibold text-left text-gray-900 mb-1">{t('op_faq_cashout')}</p>
                                    <p className="text-gray-600 text-left leading-relaxed">{t('op_faq_cashout_answer')}</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* User Name & Membership Package (hidden on small screens) */}
                    <div className="hidden md:flex flex-col items-center gap-0.5">
                        {user?.full_name && (
                            <span className="text-sm font-medium text-gray-200 truncate">
                                {user.full_name}
                            </span>
                        )}
                        {user?.membership?.packageName && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap ${getMembershipBadgeStyle(user.membership.packageName)}`}>
                                <Icon
                                    name={getMembershipIconName(user.membership.packageName) as any}
                                    size={14}
                                />
                                {user.membership.packageName}
                            </span>
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