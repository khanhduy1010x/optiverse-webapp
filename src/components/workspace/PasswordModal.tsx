import React, { useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PasswordModalProps {
    isOpen: boolean;
    newPassword: string;
    hasPassword?: boolean;
    onClose: () => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSetPassword: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
    isOpen,
    newPassword,
    hasPassword = false,
    onClose,
    onPasswordChange,
    onSetPassword
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useAppTranslate('workspace');

    if (!isOpen) return null;

    const title = hasPassword ? t('passwordModal.changeTitle') : t('passwordModal.setTitle');
    const buttonText = hasPassword ? t('passwordModal.changePassword') : t('passwordModal.setPassword'); return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal panel */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            type="button"
                            className="rounded-md px-2 py-1 text-gray-600 border border-gray-300 hover:border-gray-500 transition-colors"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            {t('passwordModal.close')}
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-4">
                        <p className="text-sm text-gray-600">
                            {t('passwordModal.description')}
                        </p>

                        <div className="">
                            <div className="relative w-full h-14 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={onPasswordChange}
                                    placeholder=" "
                                    className="peer absolute inset-0 w-full h-full bg-transparent px-3 py-2 pr-12 text-gray-900 outline-none rounded-xl"
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-500 transition-all bg-white px-1 pointer-events-none
                                        peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-[#21b4ca]
                                        peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs"
                                >
                                    {t('passwordModal.newPassword')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                        >
                            {t('passwordModal.cancel')}
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 hover:opacity-80"
                            style={{
                                color: '#21b4ca',
                                borderColor: '#21b4ca',
                                border: '1px solid #21b4ca'
                            }}
                            onClick={onSetPassword}
                            disabled={!newPassword.trim()}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;