import React from 'react';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../styles';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/auth.slice';

type BannedModalProps = {
    open: boolean;
    onClose: () => void;
};

// Khai báo kiểu cho window.store đã được định nghĩa ở nơi khác trong ứng dụng
// Không cần khai báo lại ở đây

const BannedModal: React.FC<BannedModalProps> = ({ open, onClose }) => {
    const navigate = useNavigate();

    const handleClose = React.useCallback(() => {
        onClose();
        window.store?.dispatch?.(logout());
        navigate('/');
    }, [onClose, navigate]);

    React.useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [open, handleClose]);

    return (
        <Modal
            isOpen={open}
            onRequestClose={handleClose}
            className={GROUP_CLASSNAMES.modalContainer}
            overlayClassName={GROUP_CLASSNAMES.modalOverlay}
            ariaHideApp={false}
        >
            <div className="p-8 rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-600">Account Banned</h3>
                </div>
                <div className="mb-6 text-center">
                    <p className="text-gray-700 mb-2">Please contact the administrator for more information.</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div className="bg-red-600 h-2 rounded-full animate-countdown"></div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 mt-4 text-center">You will be automatically logged out in 5 seconds.</div>
            </div>
        </Modal>
    );
};

export default BannedModal; 