import React from 'react';
import Text from '../../components/common/Text.component';
import { UserSession } from '../../types/profile/response/profile.response';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { formatDeviceInfo } from '../../hooks/profile/useLoginSession.hook';

export const ThisDeviceCard: React.FC<{ session: UserSession }> = ({
  session,
}) => {
  return (
    <div className={GROUP_CLASSNAMES.sessionCard}>
      <div className={GROUP_CLASSNAMES.sessionCardContent}>
        <div className={GROUP_CLASSNAMES.sessionCardIcon}>
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <Text className={GROUP_CLASSNAMES.sessionCardText}>
            {formatDeviceInfo(session)}
          </Text>
          <div className="flex flex-col">
            <Text className={GROUP_CLASSNAMES.sessionCardSubtext}>
              {session.ip_address || 'Unknown IP'}
            </Text>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className={GROUP_CLASSNAMES.sessionCardCurrentBadge}>
          Current session
        </span>
      </div>
    </div>
  );
};

export const SessionCard: React.FC<{
  session: UserSession;
  isActive?: boolean;
  onLogout?: (sessionId: string) => void;
}> = ({ session, isActive = true, onLogout }) => {
  return (
    <div className={GROUP_CLASSNAMES.sessionCard}>
      <div className={GROUP_CLASSNAMES.sessionCardContent}>
        <div className={GROUP_CLASSNAMES.sessionCardIcon}>
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <Text className={GROUP_CLASSNAMES.sessionCardText}>
            {formatDeviceInfo(session)}
          </Text>
          <div className="flex items-center space-x-2 mt-1">
            <Text className={GROUP_CLASSNAMES.sessionCardSubtext}>
              {session.ip_address || 'Unknown IP'}
            </Text>
            {isActive && <span className="text-gray-300">•</span>}
          </div>
        </div>
      </div>
      {isActive && onLogout && (
        <div className="flex items-center">
          <button
            onClick={() => onLogout(session._id)}
            className={GROUP_CLASSNAMES.sessionLogoutButton}
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
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};