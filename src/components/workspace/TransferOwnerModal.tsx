import React, { useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export interface TransferOwnerModalProps {
    isOpen: boolean;
    members: Array<any>; // expect frontend UserDetailDto-like objects with user_id, full_name, email, avatar_url
    currentUserId?: string | null;
    onCancel: () => void;
    onConfirm: (newOwnerId: string) => void;
}

const TransferOwnerModal: React.FC<TransferOwnerModalProps> = ({
    isOpen,
    members,
    currentUserId,
    onCancel,
    onConfirm,
}) => {
    const { t } = useAppTranslate('workspace');
    const [selected, setSelected] = useState<string>('');

    if (!isOpen) return null;

    const activeCandidates = (members || []).filter(
        (m) => m.user_id !== currentUserId && m.status === 'active',
    );

    const handleConfirm = () => {
        if (!selected) return;
        onConfirm(selected);
        setSelected('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800">{t('dashboardWorkspace.leaveWorkspace')}</h3>
                    <p className="text-sm text-gray-600 mt-2">{t('dashboardWorkspace.prompts.enterNewOwnerId') /* reuse text as explanation */}</p>

                    <div className="mt-4">
                        {activeCandidates.length === 0 && (
                            <div className="text-sm text-gray-500">{t('dashboardWorkspace.noData.noMembers')}</div>
                        )}

                        {activeCandidates.length > 0 && (
                            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg p-2">
                                {activeCandidates.map((m) => (
                                    <label
                                        key={m.user_id}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-50 ${selected === m.user_id ? 'bg-cyan-50' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="newOwner"
                                            checked={selected === m.user_id}
                                            onChange={() => setSelected(m.user_id)}
                                            className="w-4 h-4"
                                        />
                                        <img
                                            src={m.avatar_url || ''}
                                            alt={m.full_name || m.email}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium text-gray-800">{m.full_name || m.email}</div>
                                            <div className="text-xs text-gray-500">{m.email}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{m.role === 'admin' ? t('dashboardWorkspace.filters.admin') : t('dashboardWorkspace.filters.member')}</div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setSelected('');
                            onCancel();
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {t('dashboardWorkspace.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${selected ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {t('dashboardWorkspace.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferOwnerModal;
