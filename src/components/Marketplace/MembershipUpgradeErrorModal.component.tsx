import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

interface MembershipUpgradeErrorModalProps {
    isOpen: boolean;
    message?: string;
    onClose: () => void;
    autoCloseMs?: number;
}

const MembershipUpgradeErrorModal: React.FC<MembershipUpgradeErrorModalProps> = ({
    isOpen,
    message = 'You need to upgrade your package to be able to buy more',
    onClose,
    autoCloseMs = 0,
}) => {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isOpen || !autoCloseMs) return;

        const timer = setTimeout(() => {
            onClose();
        }, autoCloseMs);

        return () => clearTimeout(timer);
    }, [isOpen, autoCloseMs, onClose]);

    const handleUpgradeClick = () => {
        onClose();
        navigate('/membership');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] bg-white rounded-3xl shadow-2xl z-[3000] outline-none"
            overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm z-[3000]"
        >
            <div className="p-8 text-center">
                {/* Icon - Apple Style */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                            className="w-7 h-7 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                   Upgrade package
                </h2>

                {/* Message */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Buttons - Apple Style */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition-all duration-200 text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleUpgradeClick}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-200 text-sm shadow-md hover:shadow-lg"
                    >
Upgrade package                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MembershipUpgradeErrorModal;
