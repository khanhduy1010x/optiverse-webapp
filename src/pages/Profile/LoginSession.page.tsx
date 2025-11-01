import React, { useEffect } from 'react';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import IconProps from '../../components/common/Icon/Icon.component';
import { ConfirmationModal } from './ConfirmationModal.screen';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import { useLoginSessions } from '../../hooks/profile/useLoginSession.hook';
import {
  SessionCard,
  ThisDeviceCard,
} from '../../components/common/SessionCard.component';
import ProfileSidebar from './ProfileSidebar.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function LoginSessions() {
  const {
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
  } = useLoginSessions();

  const { t } = useAppTranslate('profile');

  return (
    <View className="w-full h-full flex">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      <View className="flex flex-1 overflow-hidden">
        {/* Using the shared ProfileSidebar component */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            <span className=" text-gray-800 text-[22px] text:bold">
              {t('login_sessions')}
            </span>
            <div className="mb-2 text-[14px] text-gray-400  text:bold">
              {t('manage_login_sessions_devices')}
            </div>
            <hr className="mb-6 border-gray-200" />

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Text>{t('loading_login_sessions')}</Text>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h3 className={GROUP_CLASSNAMES.profileSection}>
                    {t('this_device')}
                  </h3>
                  {currentSession && (
                    <ThisDeviceCard session={currentSession} />
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={GROUP_CLASSNAMES.profileSection}>
                      {t('other_active_sessions')}
                    </h3>
                    {getDisplayedActiveSessions().length > 0 && (
                      <button
                        onClick={handleLogoutAllSessions}
                        className={GROUP_CLASSNAMES.sessionLogoutAllButton}
                      >
                        {t('log_out_all_other_sessions')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {getDisplayedActiveSessions().map(session => (
                      <SessionCard
                        key={session._id}
                        session={session}
                        isActive={true}
                        onLogout={handleLogoutSession}
                      />
                    ))}
                    {activeSessions.length > 2 && (
                      <button
                        onClick={toggleShowAllSessions}
                        className={GROUP_CLASSNAMES.sessionShowMoreButton}
                      >
                        {showAllActiveSessions
                          ? t('show_less')
                          : t('show_more', {
                            count: activeSessions.length - 2,
                          })}
                      </button>
                    )}
                  </div>
                </section>

                {previousSessions.length > 0 && (
                  <section>
                    <h3 className={GROUP_CLASSNAMES.profileSection}>
                      {t('previously_logged_out_sessions')}
                    </h3>
                    <div className="space-y-4">
                      {previousSessions.map(session => (
                        <SessionCard
                          key={session._id}
                          session={session}
                          isActive={false}
                        />
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
