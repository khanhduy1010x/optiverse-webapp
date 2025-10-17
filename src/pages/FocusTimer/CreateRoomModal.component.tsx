import React, { useState } from 'react';
import { useCreateFocusRoom } from '../../hooks/focus-room/useCreateFocusRoom.hook';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
    const { createRoom, loading, error, success } = useCreateFocusRoom();

    // 🧠 Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [accessMode, setAccessMode] = useState<'free' | 'approval' | 'password'>('free');
    const [password, setPassword] = useState('');
    const [duration, setDuration] = useState<number | ''>('');
    const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
    const [tags, setTags] = useState('');
    const [autoStartTimer, setAutoStartTimer] = useState(false);
    const [allowMic, setAllowMic] = useState(true);
    const [allowCamera, setAllowCamera] = useState(true);
    const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            name: title,
            description,
            type,
            accessMode,
            password: accessMode === 'password' ? password : undefined,
            duration: duration ? Number(duration) : undefined,
            maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
            tags,
            autoStartTimer,
            allowMic,
            allowCamera,
            isRecordingEnabled,
        };

        await createRoom(formData);

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Tạo phòng mới</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                        ✕
                    </button>
                </div>

                <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tên phòng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Pomodoro nhóm A, Tập trung buổi tối"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn về mục đích phòng"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Type & AccessMode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại phòng</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'public' | 'private')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="public">Công khai</option>
                                <option value="private">Riêng tư</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cách vào phòng</label>
                            <select
                                value={accessMode}
                                onChange={(e) => setAccessMode(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="free">Tự do</option>
                                <option value="approval">Xin phép</option>
                                <option value="password">Nhập mật khẩu</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    {accessMode === 'password' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu nếu cần"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Duration & Max Participants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Thời lượng (phút)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số người tối đa</label>
                            <input
                                type="number"
                                value={maxParticipants}
                                onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nhãn</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Pomodoro, Team, Deep Work..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Features */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Các tính năng</label>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={autoStartTimer} onChange={(e) => setAutoStartTimer(e.target.checked)} />
                            <span>Tự động bật timer khi đủ người</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={allowMic} onChange={(e) => setAllowMic(e.target.checked)} />
                            <span>Cho phép bật micro</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={allowCamera} onChange={(e) => setAllowCamera(e.target.checked)} />
                            <span>Cho phép bật camera</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isRecordingEnabled}
                                onChange={(e) => setIsRecordingEnabled(e.target.checked)}
                            />
                            <span>Cho phép ghi lại buổi học</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-3 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo phòng'}
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
                    {success && <p className="text-green-600 text-sm mt-2">✅ Tạo phòng thành công!</p>}
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
