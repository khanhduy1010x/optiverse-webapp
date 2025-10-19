import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export type MemberType = 'member' | 'request' | 'invite' | 'banned';

interface User {
    user_id: string;
    full_name: string;
    email: string;
    avatar: string;
    role?: 'Admin' | 'Member';
    rawRole?: string;
    isOwner?: boolean;
    bannedDate?: string;
    permissions?: string[];
}

interface MemberCardProps {
    user: User;
    type: MemberType;
    currentUserRole?: 'owner' | 'admin' | 'member' | null;
    currentUserId?: string; // Add current user ID
    onUpRole?: (id: string) => void;
    onKick?: (id: string) => void;
    onToBlacklist?: (id: string) => void;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onBanUser?: (id: string, requestId?: string) => void;
    onUnbanAndKick?: (id: string) => void;
    onUnbanAndBack?: (id: string) => void;
    onOpenPermissionModal?: (user: User) => void;
    openMenuId?: string | null;
    onToggleMenu?: (id: string) => void;
    index?: number;
    totalCount?: number;
}

const MemberCard: React.FC<MemberCardProps> = ({
    user,
    type,
    currentUserId,
    onAccept,
    onReject,
    onBanUser,
    onUnbanAndKick,
    onUnbanAndBack,
    onOpenPermissionModal,
    onToggleMenu,
    index = 0,
    totalCount = 0
}) => {
    const { t } = useAppTranslate('workspace');

    // Check if this is the current user
    const isCurrentUser = currentUserId && user.user_id === currentUserId;
    console.log("cayy", user);
    const getCardClassName = () => {
        const isEven = index % 2 === 0;

        switch (type) {
            case 'banned':
                return `${isEven ? 'bg-red-50' : 'bg-red-100'} rounded-xl p-4 flex items-center justify-between  transition-colors border border-red-200`;
            case 'request':
                return `${isEven ? 'bg-blue-100' : 'bg-white'} rounded-xl p-4 flex items-center justify-between transition-colors border border-blue-200`;
            default:
                return `${isEven ? 'bg-gray-200' : 'bg-white'} rounded-xl p-4 flex items-center justify-between  transition-colors border border-gray-200`;
        }
    };

    const renderUserInfo = () => (
        <div className="flex items-center gap-4">
            <div className={`text-4xl ${type === 'banned' ? 'opacity-60' : ''}`}>
                <img src={user.avatar} alt={user.full_name} className="rounded-full w-14 h-14" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.role && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.isOwner
                            ? 'bg-yellow-200 text-yellow-700'
                            : user.role === 'Admin'
                                ? 'bg-purple-200 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                            {user.isOwner
                                ? t('memberCard.owner')
                                : user.role === 'Admin'
                                    ? t('memberCard.admin')
                                    : t('memberCard.member')
                            }
                        </span>
                        {isCurrentUser && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                ({t('memberCard.you')})
                            </span>
                        )}
                    </div>
                )}
                {user.bannedDate && (
                    <p className="text-xs text-red-600 mt-1">{t('memberCard.bannedDate')} {user.bannedDate}</p>
                )}
            </div>
        </div>
    );

    const renderMemberActions = () => {

        if (user.isOwner) {
            return null;
        }


        const shouldShowAbove = totalCount > 2 && index >= totalCount - 2;

        return (
            <div className="relative">
                <button
                    onClick={() => onToggleMenu && onToggleMenu(user.user_id)}
                    className="p-2 text-gray-600  hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center "
                >
                    <Icon name="moreVert" size={19} />
                </button>


            </div>
        );
    };

    const renderRequestActions = () => (
        <div className="flex gap-2">
            {onReject && (
                <button
                    onClick={() => onReject(user.user_id)}
                    className="px-4 py-2 text-red-600 border border-red-300 hover:border-red-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.reject')}
                </button>
            )}
            {onAccept && (
                <button
                    onClick={() => onAccept(user.user_id)}
                    className="px-4 py-2 text-green-600 border border-green-300 hover:border-green-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.accept')}
                </button>
            )}
            {onBanUser && (
                <button
                    onClick={() => onBanUser(user.user_id, user.user_id)}
                    className="px-4 py-2 text-red-600 border border-red-300 hover:border-red-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.banUser')}
                </button>
            )}
        </div>
    );

    const renderInviteActions = () => (
        <div className="flex gap-2">
            {onReject && (
                <button
                    onClick={() => onReject(user.user_id)}
                    className="px-4 py-2 text-red-600 border border-red-300 hover:border-red-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.cancel')}
                </button>
            )}
        </div>
    );

    const renderBannedActions = () => (
        <div className="flex gap-2">
            {onUnbanAndKick && (
                <button
                    onClick={() => onUnbanAndKick(user.user_id)}
                    className="px-4 py-2 text-orange-600 border border-orange-300 hover:border-orange-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.unbanAndKick')}
                </button>
            )}
            {onUnbanAndBack && (
                <button
                    onClick={() => onUnbanAndBack(user.user_id)}
                    className="px-4 py-2 text-blue-600 border border-blue-300 hover:border-blue-500 rounded-lg transition-colors flex items-center gap-2"
                >
                    {t('memberCard.unbanAndBack')}
                </button>
            )}
        </div>
    );

    const renderActions = () => {
        switch (type) {
            case 'member':
                return renderMemberActions();
            case 'request':
                return renderRequestActions();
            case 'invite':
                return renderInviteActions();
            case 'banned':
                return renderBannedActions();
            default:
                return null;
        }
    };

    return (
        <div
            className={`${getCardClassName()} ${type === 'member' && onOpenPermissionModal ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={() => {
                if (type === 'member' && onOpenPermissionModal) {
                    onOpenPermissionModal(user);
                }
            }}
        >
            {renderUserInfo()}
            {renderActions()}
        </div>
    );
};

export default MemberCard;