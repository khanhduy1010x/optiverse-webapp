import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { useFocusRoom } from '../../../hooks/focus-room/useFocusRoom.hook';

interface CreateRoomFormProps {
    onSuccess?: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSuccess }) => {
    const { workspaceId: paramWorkspaceId } = useParams<{ workspaceId?: string }>();
    const { t } = useAppTranslate('focus-room');
    const { createRoom, loading, error } = useFocusRoom(paramWorkspaceId);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [access_type, setAccessType] = useState<'public' | 'private'>('public');
    const [password, setPassword] = useState('');

    const workspaceId = paramWorkspaceId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            name,
            workspace_id: workspaceId,
            access_type,
            password: access_type === 'private' ? password : undefined,
            description: description || undefined,
        };

        await createRoom(formData);
        resetForm();
        onSuccess?.();
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setAccessType('public');
        setPassword('');
    };

    return (
        <div className="w-full">
            <div className="max-w-xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">{t('createRoom.title')}</h2>
                    <p className="text-sm text-gray-500 font-normal">{t('createRoom.subtitle')}</p>
                </div>

                <div className="bg-white border rounded-xl p-6" style={{ borderColor: '#e5e5e5' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Room Name & Access Type */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            {/* Room Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 mb-2">
                                    {t('createRoom.roomName')} <span style={{ color: '#ef4444' }}>{t('createRoom.required')}</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('createRoom.roomNamePlaceholder')}
                                    className="w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-400 focus:outline-none transition-all"
                                    style={{
                                        borderColor: '#e5e5e5',
                                        color: '#000'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#000'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                    required
                                />
                            </div>

                            {/* Access Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-900 mb-2">{t('createRoom.accessType')}</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAccessType('public')}
                                        className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all border"
                                        style={{
                                            backgroundColor: access_type === 'public' ? '#000' : '#ffffff',
                                            color: access_type === 'public' ? '#fff' : '#000',
                                            borderColor: access_type === 'public' ? '#000' : '#e5e5e5'
                                        }}
                                    >
                                        {t('createRoom.public')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccessType('private')}
                                        className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all border"
                                        style={{
                                            backgroundColor: access_type === 'private' ? '#000' : '#ffffff',
                                            color: access_type === 'private' ? '#fff' : '#000',
                                            borderColor: access_type === 'private' ? '#000' : '#e5e5e5'
                                        }}
                                    >
                                        {t('createRoom.private')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Description (Full width) */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-900 mb-2">{t('createRoom.description')}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('createRoom.descriptionPlaceholder')}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-400 focus:outline-none transition-all resize-none"
                                style={{
                                    borderColor: '#e5e5e5',
                                    color: '#000'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                            />
                        </div>

                        {/* Row 3: Password (Full width - only if private) */}
                        {access_type === 'private' && (
                            <div className="mb-5">
                                <div className="rounded-lg p-4 border" style={{
                                    backgroundColor: '#f9f9f9',
                                    borderColor: '#e5e5e5'
                                }}>
                                    <label className="block text-xs font-semibold text-gray-900 mb-2">
                                        {t('createRoom.password')} <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('createRoom.passwordPlaceholder')}
                                        className="w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-400 focus:outline-none transition-all bg-white"
                                        style={{
                                            borderColor: '#e5e5e5',
                                            color: '#000'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#000'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                    />
                                    <p className="text-xs text-gray-500 mt-2 font-normal">Guests need this password to join</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-lg border mb-5" style={{
                                backgroundColor: '#fef2f2',
                                borderColor: '#fecaca',
                                color: '#991b1b'
                            }}>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Row 4: Submit Buttons (Full width) */}
                        <div className="flex gap-3 pt-3 border-t" style={{ borderColor: '#e5e5e5' }}>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-all"
                                style={{
                                    borderColor: '#e5e5e5',
                                    color: '#000',
                                    backgroundColor: '#fff'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                {t('createRoom.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: loading ? '#999' : '#000',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? `${t('createRoom.create')}...` : t('createRoom.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRoomForm;
