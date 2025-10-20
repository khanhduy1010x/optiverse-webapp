import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    const { t } = useAppTranslate('workspace');

    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    iconColor: 'text-red-600',
                    iconBg: 'bg-red-100',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    titleColor: 'text-red-600'
                };
            case 'warning':
                return {
                    iconColor: 'text-yellow-600',
                    iconBg: 'bg-yellow-100',
                    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
                    titleColor: 'text-yellow-600'
                };
            case 'info':
                return {
                    iconColor: 'text-blue-600',
                    iconBg: 'bg-blue-100',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    titleColor: 'text-blue-600'
                };
            default:
                return {
                    iconColor: 'text-red-600',
                    iconBg: 'bg-red-100',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    titleColor: 'text-red-600'
                };
        }
    };

    const typeStyles = getTypeStyles();

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${typeStyles.iconBg} flex items-center justify-center ${typeStyles.iconColor}`}>
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${typeStyles.titleColor}`}>
                                {title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {cancelText || t('dashboardWorkspace.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${typeStyles.confirmBg}`}
                    >
                        {confirmText || t('dashboardWorkspace.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;