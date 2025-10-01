import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectNewAdminModalProps } from '../../types/chat/props/component.props';

const SelectNewAdminModal: React.FC<SelectNewAdminModalProps> = ({
  isOpen,
  onClose,
  onSelectAdmin,
  members,
  currentUserId,
  groupName,
  getInitials,
}) => {
  const { t } = useTranslation();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Filter out current user and existing admins to show only eligible members
  const eligibleMembers = members.filter(
    member => member.id !== currentUserId && !member.is_admin
  );

  const handleSelectAdmin = async () => {
    if (!selectedMemberId) {
      alert('Vui lòng chọn một thành viên để làm admin');
      return;
    }

    setIsProcessing(true);
    try {
      await onSelectAdmin(selectedMemberId);
      onClose();
    } catch (error) {
      console.error('Error selecting new admin:', error);
      alert('Có lỗi xảy ra khi chọn admin mới. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setSelectedMemberId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Chọn Admin Mới
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Bạn cần chọn một thành viên khác làm admin trước khi rời nhóm "{groupName}"
          </p>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {eligibleMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                Không có thành viên nào có thể làm admin
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMemberId === member.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="newAdmin"
                    value={member.id}
                    checked={selectedMemberId === member.id}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="sr-only"
                  />
                  
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#21b4ca] text-white flex items-center justify-center font-medium text-sm">
                          {getInitials(member.full_name || member.email)}
                        </div>
                      )}
                      {/* Online indicator */}
                      {member.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.full_name || member.email}
                      </p>
                      {member.full_name && member.email && (
                        <p className="text-sm text-gray-500">{member.email}</p>
                      )}
                    </div>

                    {/* Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMemberId === member.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMemberId === member.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSelectAdmin}
              disabled={!selectedMemberId || isProcessing || eligibleMembers.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                'Chọn làm Admin'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectNewAdminModal;