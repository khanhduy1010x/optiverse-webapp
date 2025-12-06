import React from 'react';
import { useTheme } from '../../contexts/theme.context';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import Icon from '../../components/common/Icon/Icon.component';
import { useUserProfile } from '../../hooks/profile/useUserProfile.hook';
import ChangePasswordPopup from './ChangePasswordPopup.screen';
import DeleteAccountModal from './DeleteAccountModal.screen';
import LogoutConfirmModal from './LogoutConfirmModal.screen';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import ProfileSidebar from './ProfileSidebar.component';
import StreakDisplay from '../../components/streak/StreakDisplay';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function UserProfile() {
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const {
    avatar,
    showChangePasswordPopup,
    setShowChangePasswordPopup,
    selectedMenu,
    handleNavigate,
    isEditingName,
    startEditingName,
    cancelEditingName,
    newFullName,
    isLoading,
    error,
    isSaving,
    saveFullName,
    isLoggingOut,
    handleLogout,
    profileData,
    isUploadingAvatar,
    showAvatarMenu,
    setShowAvatarMenu,
    handleAvatarChange,
    showAvatarModal,
    setShowAvatarModal,
    handleViewAvatar,
    handleNameChange,
    handleKeyPress,
    streakData,
    fetchProfile,
    isDeleting,
    handleDeleteAccount,
    showDeleteAccountModal,
    openDeleteAccountModal,
    closeDeleteAccountModal,
  } = useUserProfile();

  const { t } = useAppTranslate('profile');

  const getMembershipBadgeStyle = (packageName?: string) => {
    switch (packageName?.toLowerCase()) {
      case 'free':
        return 'text-gray-300 bg-gray-600 bg-opacity-20';
      case 'basic':
        return 'text-amber-400 bg-amber-500/20 border border-amber-400/30';
      case 'plus':
        return 'text-emerald-400 bg-emerald-600/20 border border-emerald-400/30';
      case 'business':
        return 'text-sky-300 bg-sky-500/15 border border-sky-300/25';
      default:
        return 'text-blue-400 bg-blue-500 bg-opacity-10';
    }
  };

  const getMembershipIconName = (packageName?: string): string => {
    switch (packageName?.toLowerCase()) {
      case 'free':
        return 'level_free';
      case 'basic':
        return 'level_0';
      case 'plus':
        return 'level_1';
      case 'business':
        return 'level_2';
      default:
        return 'star';
    }
  };

  console.log(profileData);

  return (
    <View className="w-full h-full overflow-hidden">
      {/* Avatar View Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-6 -right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white z-10 transition-all duration-200 backdrop-blur-md border border-white/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={avatar}
              alt="Avatar"
              className="max-w-[90vw] max-h-[80vh] rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className="flex-1 overflow-y-auto bg-white">
          <div className="w-full h-full overflow-y-auto bg-white">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none"></div>
            
            <div className="relative z-10 p-3 md:p-4 lg:p-5">
              {/* Header */}
              <div className="mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
                    {t('your_account')}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium max-w-2xl">
                    {t('manage_profile_information')}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 rounded-lg border border-red-400 flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mt-1 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-semibold">{error}</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-[#21b4ca]/10 rounded-full mb-4">
                      <div className="w-12 h-12 border-4 border-[#21b4ca]/30 border-t-[#21b4ca] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">{t('loading_profile_data')}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Profile Section */}
                  <div className="mb-8 grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                    {/* Avatar Card */}
                    <div className="lg:col-span-1">
                      <div
                        className="relative w-fit"
                        onMouseEnter={() => setShowAvatarMenu(true)}
                        onMouseLeave={() => setShowAvatarMenu(false)}
                      >
                        <div className="relative">
                          <img
                            src={avatar}
                            alt="User Avatar"
                            className="relative w-40 h-40 lg:w-52 lg:h-52 rounded-2xl border-4 border-gray-200 object-cover transition-all duration-300"
                          />
                          
                          {/* Hover Overlay */}
                          {showAvatarMenu && (
                            <div className="absolute inset-0 rounded-2xl bg-black/30 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 z-20">
                              <button
                                onClick={handleViewAvatar}
                                className="px-3 py-1 bg-[#21b4ca] hover:bg-[#1c9eb1] text-white font-bold rounded-md transition-all text-xs flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {t('view')}
                              </button>

                              <label
                                htmlFor="avatarUpload"
                                className="px-3 py-1 bg-[#21b4ca] hover:bg-[#1c9eb1] text-white font-bold rounded-md transition-all cursor-pointer text-xs flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                                </svg>
                                {t('change')}
                              </label>
                            </div>
                          )}

                          {isUploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-30">
                              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        <input
                          id="avatarUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={isUploadingAvatar}
                        />
                      </div>
                    </div>

                    {/* Profile Info Card */}
                    <div className="lg:col-span-3 bg-white rounded-lg p-4 lg:p-5">
                      <div className="space-y-4">
                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Full Name */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">{t('full_name')}</label>
                            {isEditingName ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newFullName}
                                  onChange={handleNameChange}
                                  onKeyDown={handleKeyPress}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:border-[#21b4ca] focus:ring-2 focus:ring-[#21b4ca]/20 font-medium transition-all text-xs"
                                  placeholder={t('enter_your_full_name')}
                                  autoFocus
                                  disabled={isSaving}
                                />
                                <button
                                  onClick={saveFullName}
                                  disabled={isSaving}
                                  className="px-2 py-2 bg-gradient-to-r from-[#21b4ca] to-[#1c9eb1] text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 text-xs shadow-md"
                                >
                                  {isSaving ? '...' : t('save')}
                                </button>
                                <button
                                  onClick={cancelEditingName}
                                  disabled={isSaving}
                                  className="px-2 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={profileData.full_name}
                                  readOnly
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold text-xs"
                                />
                                <button
                                  onClick={startEditingName}
                                  className="p-2 bg-gradient-to-br from-[#21b4ca] to-[#1c9eb1] text-white rounded-lg hover:shadow-lg hover:scale-110 transition-all shadow-md flex-shrink-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">{t('email_address')}</label>
                            <input
                              type="text"
                              value={profileData.email}
                              readOnly
                              className="w-full px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-gray-300 text-gray-900 rounded-lg font-medium text-xs"
                            />
                          </div>
                        </div>

                        {/* Change Password */}
                        <button
                          onClick={() => setShowChangePasswordPopup(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-[#21b4ca] to-[#1c9eb1] text-white font-bold rounded-lg hover:shadow-xl active:scale-95 transition-all text-xs shadow-lg uppercase tracking-wide"
                        >
                          {t('change_password_button')}
                        </button>
                      </div>
                    </div>

                    {/* Streak Display - Right Side */}
                    <div className="lg:col-span-1">
                      <StreakDisplay streakData={streakData} />
                    </div>
                  </div>

                  {/* Membership Section */}
                  {!isLoading && profileData.membership && profileData.membership.package_id && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">{t('subscription_plan')}</h2>

                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 md:p-5 border border-slate-200">
                        
                        {/* Plan Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white font-semibold ${
                              profileData.membership.package_id.name?.toLowerCase() === 'free'
                                ? 'bg-slate-400'
                                : profileData.membership.package_id.name?.toLowerCase() === 'basic'
                                ? 'bg-amber-500'
                                : profileData.membership.package_id.name?.toLowerCase() === 'plus'
                                ? 'bg-emerald-500'
                                : 'bg-[#21b4ca]'
                            }`}>
                              <Icon
                                name={getMembershipIconName(profileData.membership.package_id.name) as any}
                                size={28}
                                className="text-white"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-0.5">{t('current_plan')}</p>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {profileData.membership.package_id.name}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Plan Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">{t('op_bonus')}</p>
                            <p className="text-lg font-bold text-[#21b4ca]">+{profileData.membership.package_id.opBonusCredits.toLocaleString()}</p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">{t('duration')}</p>
                            <p className="text-lg font-bold text-gray-900">{profileData.membership.package_id.duration_days}</p>
                            <p className="text-xs text-gray-500 font-medium">{t('days')}</p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">{t('started')}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(profileData.membership.start_date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">{t('expires')}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(profileData.membership.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Progress */}
                        {(() => {
                          const start = new Date(profileData.membership.start_date).getTime();
                          const end = new Date(profileData.membership.end_date).getTime();
                          const now = Date.now();
                          const percentage = Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);

                          return (
                            <div className="mb-5">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-700">{t('plan_active_period')}</span>
                                <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-300 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#21b4ca] rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Button */}
                        <button
                          onClick={() => handleNavigate('membership', '/membership')}
                          className="w-full py-2.5 px-4 bg-[#21b4ca] hover:bg-[#1c9eb1] text-white font-semibold rounded-lg transition-colors active:scale-95 text-xs"
                        >
                          View Plans & Upgrade
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-5"></div>

                  {/* Danger Zone */}
                  <div className="space-y-8">

                    {/* Delete Card */}
                    <div className="rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 mb-1">{t('delete_my_account')}</h3>
                          <p className="text-sm text-gray-700 font-semibold">
                            {t('permanently_delete_account_description')}
                          </p>
                        </div>
                        <button
                          onClick={openDeleteAccountModal}
                          disabled={isDeleting}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-md transition-all active:scale-95 flex-shrink-0 uppercase tracking-wide text-xs disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : t('delete')}
                        </button>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        disabled={isLoggingOut}
                        className="px-6 py-2 bg-[#21b4ca] hover:bg-[#1c9eb1] text-white font-black text-xs rounded-md transition-all active:scale-95 disabled:opacity-50 uppercase tracking-wide"
                      >
                        {isLoggingOut ? t('logging_out') : t('logout')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </View>
      </View>

      {showChangePasswordPopup && (
        <ChangePasswordPopup
          onClose={() => setShowChangePasswordPopup(false)}
          hasPassword={profileData.has_password}
          refreshData={fetchProfile}
        />
      )}

      {showDeleteAccountModal && (
        <DeleteAccountModal
          isOpen={showDeleteAccountModal}
          isDeleting={isDeleting}
          onConfirm={handleDeleteAccount}
          onCancel={closeDeleteAccountModal}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          isLoading={isLoggingOut}
          onConfirm={() => {
            handleLogout();
            setShowLogoutConfirm(false);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </View>
  );
}

