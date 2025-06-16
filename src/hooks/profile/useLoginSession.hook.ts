import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile.service';
import { UserSession } from '../../types/profile/response/profile.response';

const SESSIONS_PER_PAGE = 2;

export function useLoginSessions() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>('login-sessions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(
    null
  );
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [previousSessions, setPreviousSessions] = useState<UserSession[]>([]);
  const [showAllActiveSessions, setShowAllActiveSessions] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
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
      console.log(data);
      setCurrentSession(data.current_session);
      setActiveSessions(
        data.active_sessions.filter(
          (session: UserSession) => session._id !== data.current_session._id
        )
      );
      setPreviousSessions(data.previous_sessions);
    } catch (error: any) {
      setError(
        error.message || 'Failed to load login sessions. Please try again.'
      );
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
          setConfirmModal(prev => ({ ...prev, isOpen: false }));

          // Update active sessions state directly
          setActiveSessions(prevSessions =>
            prevSessions.filter(session => session._id !== sessionId)
          );

          // Move the logged out session to previous sessions
          const loggedOutSession = activeSessions.find(
            session => session._id === sessionId
          );
          if (loggedOutSession) {
            setPreviousSessions(prev => [loggedOutSession, ...prev]);
          }
        } catch (error: any) {
          setError(
            error.message || 'Failed to logout session. Please try again.'
          );
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
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          await fetchLoginSessions();
        } catch (error: any) {
          setError(
            error.message || 'Failed to logout all sessions. Please try again.'
          );
        }
      },
    });
  };

  const toggleShowAllSessions = () => {
    setShowAllActiveSessions(prev => !prev);
  };

  const getDisplayedActiveSessions = () => {
    console.log(activeSessions);
    return activeSessions;
  };

  return {
    selectedMenu,
    handleNavigate,
    confirmModal,
    setConfirmModal,
    error,
    isLoading,
    currentSession,
    getDisplayedActiveSessions,
    handleLogoutAllSessions,
    toggleShowAllSessions,
    showAllActiveSessions,
    activeSessions,
    previousSessions,
    handleLogoutSession,
  };
}

export const formatDeviceInfo = (session: UserSession) =>
  session.device_info || 'Unknown Device';
export const formatLastActivity = (session: UserSession) =>
  session.updatedAt ? new Date(session.updatedAt).toLocaleString() : 'Unknown';
