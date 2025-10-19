import React from 'react';
import Toast from './Toast';
import { ToastData } from '../../../hooks/useToast';

interface ToastContainerProps {
    toasts: ToastData[];
    onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
    return (
        <>
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ top: `${1 + index * 4.5}rem` }}
                    className="fixed right-4 z-[200]"
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => onRemoveToast(toast.id)}
                    />
                </div>
            ))}
        </>
    );
};

export default ToastContainer;