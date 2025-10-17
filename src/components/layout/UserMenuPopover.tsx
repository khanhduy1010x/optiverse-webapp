import React from 'react';

import { motion, AnimatePresence } from "framer-motion";

interface UserMenuPopoverProps {
    className?: string;
    name?: string;
    email?: string;
    onProfile?: () => void;
    onNotifications?: () => void;
    onLogout?: () => void;
}

const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({
    className = '',
    name = 'User',
    email,
    onProfile,
    onNotifications,
    onLogout,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden ${className}`}>
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{name}</p>
                {email && <p className="text-xs text-gray-500">{email}</p>}
            </div>
            <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={onProfile}>
                    Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50" onClick={onNotifications}>
                    Notifications
                </button>
            </div>
            <div className="border-t border-gray-100">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </motion.div>
    );
};

export default UserMenuPopover;
