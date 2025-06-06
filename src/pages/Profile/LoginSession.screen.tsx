import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import IconProps from '../../components/common/Icon/Icon.component';
import profileService, { UserSession } from '../../services/profile.service';

const SESSIONS_PER_PAGE = 2; // Number of sessions to show initially

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LoginSessions() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>('login-sessions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [previousSessions, setPreviousSessions] = useState<UserSession[]>([]);
  const [showAllActiveSessions, setShowAllActiveSessions] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchLoginSessions();
  }, []);

  const fetchLoginSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileService.getLoginSessions();
      
      setCurrentSession(data.current_session);
      // Filter out current session and sessions with same IP
      setActiveSessions(data.active_sessions.filter(session => 
        session._id !== data.current_session._id && 
        session.ip_address !== data.current_session.ip_address
      ));
      setPreviousSessions(data.previous_sessions);
    } catch (error: any) {
      console.error('Failed to fetch login sessions:', error);
      setError(error.message || 'Failed to load login sessions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (menuKey: string, path: string) => {
    setSelectedMenu(menuKey);
    navigate(path);
  };

  const handleLogoutSession = async (sessionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out this session?',
      onConfirm: async () => {
        try {
          await profileService.logoutSession(sessionId);
          await fetchLoginSessions();
        } catch (error: any) {
          console.error('Failed to logout session:', error);
          setError(error.message || 'Failed to logout session. Please try again.');
        }
      },
    });
  };

  const handleLogoutAllSessions = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Logout All',
      message: 'Are you sure you want to log out all other sessions?',
      onConfirm: async () => {
        try {
          await profileService.logoutAllOtherSessions();
          await fetchLoginSessions();
        } catch (error: any) {
          console.error('Failed to logout all sessions:', error);
          setError(error.message || 'Failed to logout all sessions. Please try again.');
        }
      },
    });
  };

  const formatDeviceInfo = (session: UserSession) => {
    return session.device_info || 'Unknown Device';
  };

  const formatLastActivity = (session: UserSession) => {
    if (!session.updatedAt) return 'Unknown';
    return new Date(session.updatedAt).toLocaleString();
  };

  const toggleShowAllSessions = () => {
    setShowAllActiveSessions(!showAllActiveSessions);
  };

  const getDisplayedActiveSessions = () => {
    // Filter out current session from active sessions
    const otherSessions = activeSessions.filter(session => !session.is_current);
    if (showAllActiveSessions) {
      return otherSessions;
    }
    return otherSessions.slice(0, SESSIONS_PER_PAGE);
  };

  const ThisDeviceCard: React.FC<{ session: UserSession }> = ({ session }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <Text className="font-medium text-gray-900 text-base">{formatDeviceInfo(session)}</Text>
          <div className="flex flex-col">
            <Text className="text-sm text-gray-500">{session.ip_address || 'Unknown IP'}</Text>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">Current session</span>
      </div>
    </div>
  );

  const SessionCard: React.FC<{ session: UserSession; isActive?: boolean }> = ({ session, isActive = true }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <Text className="font-medium text-gray-900">{formatDeviceInfo(session)}</Text>
          <div className="flex items-center space-x-2 mt-1">
            <Text className="text-sm text-gray-500">{session.ip_address || 'Unknown IP'}</Text>
            {isActive && (
              <>
                <span className="text-gray-300">•</span>
               
              </>
            )}
          </div>
        </div>
      </div>
      {isActive && (
        <div className="flex items-center">
          <button
            onClick={() => handleLogoutSession(session._id)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <View className="w-full h-screen flex">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      <View className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <View 
          className="w-1/5 overflow-y-auto bg-white" 
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <ul className="space-y-4 p-4">
            <li>
              <button
                onClick={() => handleNavigate('profile', '/user-profile')}
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'profile' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Profile
                <IconProps name="chevron" size={selectedMenu === 'profile' ? 28 : 20} className="ml-2" />
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('achievements', '/achievements')}
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'achievements' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Achievements
                <IconProps name="chevron" size={selectedMenu === 'achievements' ? 28 : 20} className="ml-2" />
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('friends', '/friends')}
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'friends' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Friends
                <IconProps name="chevron" size={selectedMenu === 'friends' ? 28 : 20} className="ml-2" />
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('login-sessions', '/login-session')}
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'login-sessions' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Login Sessions
                <IconProps name="chevron" size={selectedMenu === 'login-sessions' ? 28 : 20} className="ml-2" />
              </button>
            </li>
          </ul>
        </View>

        {/* Main Content */}
        <View 
          className="flex-1 overflow-y-auto border-l border-gray-300 dark:border-gray-600"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="p-8">
            <Text textStyle="regular32" className="mb-4 text-gray-800 text:bold">Login Sessions</Text>
            <hr className="mb-6 border-gray-200" />

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Text>Loading login sessions...</Text>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">This device</h3>
                  {currentSession && <ThisDeviceCard session={currentSession} />}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Other active sessions</h3>
                    {getDisplayedActiveSessions().length > 0 && (
                      <button
                        onClick={handleLogoutAllSessions}
                        className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg"
                      >
                        Log out all other sessions
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {getDisplayedActiveSessions().map(session => (
                      <SessionCard key={session._id} session={session} isActive={true} />
                    ))}
                    {activeSessions.filter(session => !session.is_current).length > SESSIONS_PER_PAGE && (
                      <button
                        onClick={toggleShowAllSessions}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {showAllActiveSessions ? (
                          <>
                            <span>Show less</span>
                            <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Show {activeSessions.filter(session => !session.is_current).length - SESSIONS_PER_PAGE} more</span>
                            <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </section>

                {previousSessions.length > 0 && (
                  <section>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Previously logged-out sessions</h3>
                    <div className="space-y-4">
                      {previousSessions.map(session => (
                        <SessionCard key={session._id} session={session} isActive={false} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </View>
      </View>
    </View>
  );
} 