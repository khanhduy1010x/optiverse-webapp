import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useTaskLimitByMembership } from '../../hooks/import/useTaskLimitByMembership.hook';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

interface TaskLimitExceededUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptedCount: number;
  tasksCreatedToday?: number;
  errorDetails?: {
    currentLevel?: string;
    currentLimit?: number;
    tasksRemaining?: number;
    tasksCreatedToday?: number;
    resetTime?: string;
  };
  upgradeInfo?: {
    suggestedLevel?: string;
    suggestedLimit?: number;
    limitIncrease?: number;
    benefits?: string[];
  };
}

const TaskLimitExceededUpgradeModal: React.FC<TaskLimitExceededUpgradeModalProps> = ({
  isOpen,
  onClose,
  attemptedCount,
  tasksCreatedToday = 0,
  errorDetails,
  upgradeInfo,
}) => {
  const { t } = useAppTranslate('task');
  const navigate = useNavigate();
  const { taskLimit, membershipLevel } = useTaskLimitByMembership();
  const user = useAppSelector((state) => state.auth.user);

  // Map membershipLevel to name
  const getMembershipName = (level: number) => {
    if (level === -1) return 'FREE';      // FREE (not active membership)
    switch (level) {
      case 0: return 'BASIC';
      case 1: return 'PLUS';
      case 2: return 'BUSINESS';
      default: return 'FREE';
    }
  };

  // Get next upgrade level
  const getNextUpgradeLevel = (level: number) => {
    if (level === -1) return { name: 'BASIC', benefit: 'from 10 to 20 tasks per day' };
    switch (level) {
      case 0: return { name: 'PLUS', benefit: 'from 20 to 50 tasks per day' };
      case 1: return { name: 'BUSINESS', benefit: 'Unlimited tasks per day' };
      case 2: return { name: 'BUSINESS', benefit: 'You already have the highest plan' };
      default: return { name: 'BUSINESS', benefit: 'Unlimited tasks per day' };
    }
  };

  const currentPlan = getMembershipName(membershipLevel);
  const nextUpgrade = getNextUpgradeLevel(membershipLevel);

  const handleUpgrade = () => {
    onClose();
    navigate('/membership');
  };

  if (!isOpen) return null;

  // Calculate next reset time (tomorrow 00:00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const resetTimeStr = tomorrow.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="p-6">
          {/* Header with Icon */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-amber-100 p-2.5 rounded-full">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Task Limit Reached</h2>
            <p className="text-xs text-gray-600 mt-1">
              You have reached your daily limit
            </p>
          </div>

          {/* Current Plan Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Current Plan</span>
                <span className="font-semibold text-gray-900 text-xs">{errorDetails?.currentLevel || currentPlan}</span>
              </div>
              <div className="w-full h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Daily Task Limit</span>
                <span className="font-semibold text-gray-900 text-xs">{errorDetails?.currentLimit ?? taskLimit} tasks</span>
              </div>
              <div className="w-full h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Tasks Created Today</span>
                <span className="font-semibold text-gray-900 text-xs">{errorDetails?.tasksCreatedToday ?? tasksCreatedToday} / {errorDetails?.currentLimit ?? taskLimit}</span>
              </div>
              <div className="w-full h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Limit Resets</span>
                <span className="font-semibold text-gray-900 text-xs">{resetTimeStr}</span>
              </div>
            </div>
          </div>

          {/* Upgrade Suggestion Card */}
          <div className="mb-4 p-3 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex gap-2 mb-2">
              <span className="text-blue-600 text-lg shrink-0">⚡</span>
              <p className="text-xs font-semibold text-blue-900">Upgrade Your Plan</p>
            </div>
            <p className="text-xs text-blue-800 mb-2">
              Upgrade to <span className="font-bold">{upgradeInfo?.suggestedLevel || nextUpgrade.name}</span> to get <span className="font-bold">{upgradeInfo?.limitIncrease ? `+${upgradeInfo.limitIncrease} more tasks per day` : nextUpgrade.benefit}</span>
            </p>
            <ul className="space-y-1">
              {upgradeInfo?.benefits ? (
                upgradeInfo.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-xs text-blue-800">
                    <span className="text-blue-600 font-bold">+</span>
                    <span>{benefit}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-1.5 text-xs text-blue-800">
                    <span className="text-blue-600 font-bold">+</span>
                    <span>Unlimited daily tasks</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-xs text-blue-800">
                    <span className="text-blue-600 font-bold">+</span>
                    <span>Team workspace</span>
                  </li>
                </>
              )}
            </ul>
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
              className="px-4 py-2 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              Upgrade Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskLimitExceededUpgradeModal;
