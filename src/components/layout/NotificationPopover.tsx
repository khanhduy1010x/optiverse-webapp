import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

export interface NotificationItem {
    id: string;
    title: string;
    description?: string;
    read?: boolean;
    time?: string;
}

interface NotificationPopoverProps {
    className?: string;
    notifications?: NotificationItem[];
    onViewAll?: () => void;
    onMarkAllRead?: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
    className = '',
    notifications = [],
    onViewAll,
    onMarkAllRead,
}) => {
    const hasItems = notifications.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }} className={`absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-30 ${className}`}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">Notifications</span>
                {onViewAll && (
                    <button className="text-xs text-blue-600 hover:underline" onClick={onViewAll}>
                        View all
                    </button>
                )}
            </div>

            <div className="max-h-72 overflow-auto">
                {!hasItems && (
                    <div className="px-4 py-3 text-sm text-gray-600">You're all caught up! 🎉</div>
                )}
                {hasItems && (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <li key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>
                                <p className="font-medium">{n.title}</p>
                                {n.description && <p className="text-gray-500 mt-0.5">{n.description}</p>}
                                {n.time && <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="px-4 py-2 border-t border-gray-100 text-right">
                {onMarkAllRead && (
                    <button className="text-xs text-gray-500 hover:text-gray-700" onClick={onMarkAllRead}>
                        Mark all as read
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default NotificationPopover;
