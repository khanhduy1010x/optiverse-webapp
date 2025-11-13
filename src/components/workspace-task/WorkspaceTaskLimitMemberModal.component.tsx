import React from 'react';
import { AlertTriangle, Mail, MessageCircle, X } from 'lucide-react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Modal from 'react-modal';

interface WorkspaceTaskLimitMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
  ownerName?: string;
  ownerEmail?: string;
  errorDetails?: {
    membershipLevel?: string;
    currentLevel?: string;
    currentLimit?: number;
    tasksCreatedToday?: number;
    resetTime?: string;
  };
  upgradeInfo?: {
    suggestedLevel?: string;
    suggestedLimit?: number | string;
    limitIncrease?: number | string;
  };
}

const WorkspaceTaskLimitMemberModal: React.FC<WorkspaceTaskLimitMemberModalProps> = ({
  isOpen,
  onClose,
  workspaceName = 'this workspace',
  ownerName = 'the workspace owner',
  ownerEmail,
  errorDetails,
  upgradeInfo,
}) => {
  const { t } = useAppTranslate('workspace-task');

  // Debug log
  console.log('[WorkspaceTaskLimitMemberModal] 🎨 Rendering modal with props:');
  console.log('[WorkspaceTaskLimitMemberModal]   isOpen:', isOpen);
  console.log('[WorkspaceTaskLimitMemberModal]   ownerName:', ownerName);
  console.log('[WorkspaceTaskLimitMemberModal]   errorDetails:', errorDetails);

  if (!isOpen) return null;

  const formatResetTime = (): string => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      return tomorrow.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'tomorrow at midnight';
    }
  };

  const handleContactOwner = () => {
    if (ownerEmail) {
      const subject = encodeURIComponent(`Upgrade Request for ${workspaceName}`);
      const body = encodeURIComponent(
        `Hi ${ownerName},\n\n` +
        `I hope this message finds you well!\n\n` +
        `I wanted to reach out because we've hit the daily task limit (${errorDetails?.currentLimit || 20} tasks) for our workspace "${workspaceName}".\n\n` +
        `To help our team be more productive, it would be great if we could upgrade to the ${upgradeInfo?.suggestedLevel || 'PLUS'} plan, which would give us ${upgradeInfo?.suggestedLimit || 50} tasks per day.\n\n` +
        `Could you please consider upgrading the workspace when you have a chance?\n\n` +
        `Thank you for your support!\n\n` +
        `Best regards`
      );
      window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
    }
  };

  const handleCopyMessage = () => {
    const message = 
      `Hi ${ownerName},\n\n` +
      `We've reached the daily task limit (${errorDetails?.currentLimit || 20} tasks) for workspace "${workspaceName}".\n\n` +
      `Could we upgrade to ${upgradeInfo?.suggestedLevel || 'PLUS'} to get ${upgradeInfo?.suggestedLimit || 50} tasks per day?\n\n` +
      `Thank you!`;
    
    navigator.clipboard.writeText(message).then(() => {
      alert('Message copied to clipboard! You can now paste it to send to the workspace owner.');
    });
  };

  return (
    <Modal
      isOpen={true}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-50 outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      onRequestClose={onClose}
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Icon & Title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-11 w-11 rounded-full bg-amber-50 border-2 border-amber-200">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                Daily Task Limit Reached
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {workspaceName} has reached its daily limit
              </p>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Current Plan
                </span>
                <span className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-white rounded-full border border-gray-300">
                  {errorDetails?.membershipLevel || errorDetails?.currentLevel || 'BASIC'}
                </span>
              </div>
              <div className="w-full h-px bg-gray-300" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Tasks Created Today
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {errorDetails?.tasksCreatedToday || errorDetails?.currentLimit || 20} / {errorDetails?.currentLimit || 20}
                </span>
              </div>
              <div className="w-full h-px bg-gray-300" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Limit Resets
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatResetTime()}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {ownerName?.[0]?.toUpperCase() || 'O'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Workspace Owner
                </p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {ownerName}
                </p>
                {ownerEmail && (
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {ownerEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Suggestion */}
          <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-emerald-900 mb-2 text-sm flex items-center gap-2">
              <span className="text-lg">💡</span>
              Suggested Upgrade
            </h4>
            <p className="text-sm text-emerald-800 leading-relaxed">
              Ask <span className="font-bold">{ownerName}</span> to upgrade to{' '}
              <span className="font-bold text-emerald-900">{upgradeInfo?.suggestedLevel || 'PLUS'}</span>{' '}
              plan to increase the limit from{' '}
              <span className="font-semibold">{errorDetails?.currentLimit || 20}</span> to{' '}
              <span className="font-semibold text-emerald-900">
                {typeof upgradeInfo?.suggestedLimit === 'number' && isFinite(upgradeInfo.suggestedLimit)
                  ? `${upgradeInfo.suggestedLimit}`
                  : upgradeInfo?.suggestedLimit === 'Unlimited' || upgradeInfo?.suggestedLimit === Infinity
                  ? 'unlimited'
                  : '50'}
              </span>{' '}
              tasks per day.
            </p>
          </div>

          {/* Action Message */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-semibold">💬 What you can do:</span> Contact the workspace owner to request an upgrade, or wait until {formatResetTime()} when the limit resets.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Close
            </button>
            {ownerEmail && (
              <button
                onClick={handleContactOwner}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Owner
              </button>
            )}
            <button
              onClick={handleCopyMessage}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Copy Message
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceTaskLimitMemberModal;
