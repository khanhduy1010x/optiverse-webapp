import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Modal from 'react-modal';

interface WorkspaceTaskLimitExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
  ownerName?: string;
  errorDetails?: {
    membershipLevel?: string; // Changed from currentLevel to match backend
    currentLevel?: string; // Keep for backward compatibility
    currentLimit?: number;
    tasksCreatedToday?: number;
    resetTime?: string;
  };
  upgradeInfo?: {
    suggestedLevel?: string;
    suggestedLimit?: number | string;
    limitIncrease?: number | string;
    benefits?: string[];
  };
}

const WorkspaceTaskLimitExceededModal: React.FC<WorkspaceTaskLimitExceededModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  ownerName,
  errorDetails,
  upgradeInfo,
}) => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('workspace-task');

  // Debug log
  console.log('[WorkspaceTaskLimitModal] 🎨 Rendering modal with props:');
  console.log('[WorkspaceTaskLimitModal]   isOpen:', isOpen);
  console.log('[WorkspaceTaskLimitModal]   errorDetails:', errorDetails);
  console.log('[WorkspaceTaskLimitModal]   upgradeInfo:', upgradeInfo);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/membership');
  };

  const formatResetTime = (): string => {
    try {
      // Calculate tomorrow at 00:00 (midnight)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Format with date and time: "Nov 7, 12:00 AM"
      return tomorrow.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'tomorrow';
    }
  };

  return (
    <Modal
      isOpen={true}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-50 outline-none"
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
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                Workspace Task Limit Reached
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                You have reached your daily limit
              </p>
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">
                Current Plan
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {errorDetails?.membershipLevel || errorDetails?.currentLevel || 'BASIC'}
              </span>
            </div>
            <div className="w-full h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">
                Daily Task Limit
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {errorDetails?.currentLimit || 20} tasks
              </span>
            </div>
            <div className="w-full h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">
                Limit Resets
              </span>
              <span className="text-xs font-semibold text-gray-900">
                {formatResetTime()}
              </span>
            </div>
          </div>

          {/* Upgrade Suggestion Card */}
          <div className="mb-4 p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
              <span>⚡</span>
              Upgrade Your Plan
            </h4>
            <p className="text-xs text-blue-800 mb-2">
              Upgrade to{' '}
              <span className="font-semibold">{upgradeInfo?.suggestedLevel || 'PLUS'}</span>{' '}
              to get{' '}
              <span className="font-semibold">
                {typeof upgradeInfo?.suggestedLimit === 'number' && isFinite(upgradeInfo.suggestedLimit)
                  ? `${upgradeInfo.suggestedLimit} tasks per day`
                  : upgradeInfo?.suggestedLimit === 'Unlimited' || upgradeInfo?.suggestedLimit === Infinity
                  ? 'unlimited tasks per day'
                  : '50 tasks per day'}
              </span>
            </p>
            {upgradeInfo?.benefits && upgradeInfo.benefits.length > 0 && (
              <ul className="space-y-1">
                {upgradeInfo.benefits.slice(0, 2).map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-blue-800">
                    <span className="text-blue-600 font-bold">+</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              Upgrade Now
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceTaskLimitExceededModal;
