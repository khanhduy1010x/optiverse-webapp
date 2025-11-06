import React from 'react';
import { useTheme } from '../../contexts/theme.context';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import Icon from '../../components/common/Icon/Icon.component';
import { useUserProfile } from '../../hooks/profile/useUserProfile.hook';
import ChangePasswordPopup from './ChangePasswordPopup.screen';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import ProfileSidebar from './ProfileSidebar.component';
import StreakDisplay from '../../components/streak/StreakDisplay';
import { useAppTranslate } from '../../hooks/useAppTranslate';
export default function UserProfile() {
  const { theme, toggleTheme } = useTheme();
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
  } = useUserProfile();

  const { t } = useAppTranslate('profile');

  // Get membership badge style based on package type
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

  // Get membership badge icon name based on package type
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
    <View className="w-full dark:border-gray-700 rounded-lg h-full  overflow-hidden">
      {/* Avatar View Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white/90 hover:text-white z-10 transition-all duration-200 border border-white/20 backdrop-blur-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
              className="max-w-[90vw] max-h-[80vh] rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar - Now using the shared ProfileSidebar component */}
        <ProfileSidebar
          selectedMenu={selectedMenu}
          handleNavigate={handleNavigate}
        />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[22px] text-gray-800 text:bold">
                  {t('my_profile')}
                </span>
                <div className="text-[14px] text-gray-400 text:bold">
                  {t('manage_profile_information')}
                </div>
              </div>

              {/* Streak Display Component - Positioned at the top right */}
              <div className="flex-1 flex justify-end">
                <StreakDisplay streakData={streakData} />
              </div>
            </div>

            <hr className="mb-6 border-gray-200" />

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Text title="Loading">{t('loading_profile_data')}</Text>
              </div>
            ) : (
              <View className="max-w-2xl">
                <View className="flex items-start gap-8 mb-10">
                  <div
                    className="group"
                    onMouseEnter={() => setShowAvatarMenu(true)}
                    onMouseLeave={() => setShowAvatarMenu(false)}
                  >
                    <div className="relative">
                      <img
                        src={avatar}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full border border-gray-100 shadow object-cover"
                      />
                      {/* Hover Menu */}
                      {showAvatarMenu && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2 rounded-full">
                          <button
                            onClick={handleViewAvatar}
                            className="text-white text-sm hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {t('view')}
                          </button>

                          <label
                            htmlFor="avatarUpload"
                            className="text-white text-sm hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                              />
                            </svg>
                            {t('change')}
                          </label>
                        </div>
                      )}

                      {/* Loading Overlay */}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="avatarUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                  </div>

                  <View className="flex-1 space-y-4">
                    <View className="relative">
                      {isEditingName ? (
                        <div className="relative">
                          <div className="flex items-center bg-white  rounded-lg shadow-sm border border-gray-200  focus-within:ring-blue-200 transition-all duration-200">
                            <input
                              type="text"
                              value={newFullName}
                              onChange={handleNameChange}
                              onKeyDown={handleKeyPress}
                              className="flex-1 px-4 py-2.5 bg-transparent border-none focus:outline-none text-gray-700  placeholder-gray-400"
                              placeholder={t('enter_your_full_name')}
                              autoFocus
                              disabled={isSaving}
                            />
                            <div className="flex items-center gap-2 px-3">
                              <button
                                onClick={saveFullName}
                                disabled={isSaving}
                                className="px-4 py-1.5 bg-[#21b4ca] text-white text-sm font-medium rounded-md hover:bg-[#1c9eb1] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isSaving && (
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                )}
                                {isSaving ? t('saving') : t('save')}
                              </button>
                              <button
                                onClick={cancelEditingName}
                                disabled={isSaving}
                                className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t('cancel')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={profileData.full_name}
                            readOnly
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-default focus:outline-none text-gray-700 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700"
                            placeholder={t('full_name')}
                          />
                          <button
                            onClick={startEditingName}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <div className="w-8 h-8 bg-[#21b4ca] rounded-full flex items-center justify-center hover:bg-[#1c9eb1] transition-colors duration-200">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                              </svg>
                            </div>
                          </button>
                        </div>
                      )}
                    </View>

                    <View className="relative">
                      <input
                        type="text"
                        value={profileData.email}
                        readOnly
                        className="w-full p-2.5 border border-gray-200 rounded-md cursor-default focus:outline-none text-gray-700"
                        placeholder={t('email')}
                      />
                    </View>

                    <button
                      onClick={() => setShowChangePasswordPopup(true)}
                      className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      {t('change_password')}
                    </button>
                  </View>
                </View>
              </View>
            )}

            {/* Membership Section - Separated Below */}
            {!isLoading && profileData.membership && profileData.membership.package_id && (
              <View className="mt-12 mb-4">
                <Text
                  title='                  Your Plans
'
                  className="mb-4 font-semibold text-xl text-slate-900 dark:text-white"
                >
                </Text>

                <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${getMembershipBadgeStyle(profileData.membership.package_id.name)?.includes('text-gray') ? 'bg-gray-600' : getMembershipBadgeStyle(profileData.membership.package_id.name)?.includes('text-amber') ? 'bg-amber-600' : getMembershipBadgeStyle(profileData.membership.package_id.name)?.includes('text-emerald') ? 'bg-emerald-600' : 'bg-sky-600'}`}>
                        <Icon
                          name={getMembershipIconName(profileData.membership.package_id.name) as any}
                          size={24}
                          className="text-white"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Plan</p>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {profileData.membership.package_id.name}
                        </h3>
                      </div>
                    </div>

                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${getMembershipBadgeStyle(profileData.membership.package_id.name)}`}>
                      {profileData.membership.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-white border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-xl">
                      <p className="text-xs text-slate-500 font-semibold mb-1">OP BONUS</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        +{profileData.membership.package_id.opBonusCredits.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-xl">
                      <p className="text-xs text-slate-500 font-semibold mb-1">DURATION</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {profileData.membership.package_id.duration_days}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">days</p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-xl">
                      <p className="text-xs text-slate-500 font-semibold mb-1">STARTED</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date(profileData.membership.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 rounded-xl">
                      <p className="text-xs text-slate-500 font-semibold mb-1">EXPIRES</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
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
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Membership Usage</span>
                          <span>{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Button */}
                  <button
                    onClick={() => handleNavigate('membership', '/membership')}
                    className="w-full py-3 px-4 !bg-white hover:bg-slate-800 text-black text-sm font-medium rounded-lg transition-all active:scale-[0.98]"
                  >
                    Upgrade or Renew Plan
                  </button>

                </div>
              </View>
            )}

            <hr className="mb-6 border-gray-300 dark:border-gray-600" />

            <View className="space-y-6">
              {/* <View className="flex items-center justify-between">
                <Text title="Language">{t('language')}</Text>
                <select className="w-32 p-1 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-200">
                  <option>{t('dropdown')}</option>
                </select>
              </View>
              <View className="flex items-center justify-between">
                <Text title="Theme">{t('theme')}</Text>
                <button
                  onClick={toggleTheme}
                  className="w-32 p-1 border border-dark-300 rounded dark:bg-dark-800 dark:text-dark-200 hover:bg-dark-300 dark:hover:bg-dark-600"
                >
                  {theme.colors.primary}
                </button>
              </View> */}
              <View className="flex items-center justify-between">
                <View>
                  <Text title="Delete Account">{t('delete_my_account')}</Text>
                  <Text title="Description" className="block text-sm text-gray-500 dark:text-gray-400">
                    {t('permanently_delete_account_description')}
                  </Text>
                </View>
                <button className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600">
                  {t('delete')}
                </button>
              </View>
              <View className="flex justify-end mt-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-[#21b4ca] text-white py-1 px-4 rounded hover:bg-[#1c9eb1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? t('logging_out') : t('logout')}
                </button>
              </View>
            </View>
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
    </View>
  );
}
