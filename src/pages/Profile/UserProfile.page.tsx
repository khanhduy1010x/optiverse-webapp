import React from 'react';
import { useTheme } from '../../contexts/theme.context';
import View from '../../components/common/View.component';
import Text from '../../components/common/Text.component';
import IconProps from '../../components/common/Icon/Icon.component';
import { useUserProfile } from '../../hooks/profile/useUserProfile.hook';
import ChangePasswordPopup from './ChangePasswordPopup.screen';

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
  } = useUserProfile();

  return (
    <View className="w-full h-full dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
      {/* Avatar View Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
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
              alt="User Avatar"
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <View className="flex">
        <View className="w-1/5 min-h-screen p-4">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleNavigate('profile', '/user-profile')}
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'profile' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Profile
                <IconProps
                  name="chevron"
                  size={selectedMenu === 'profile' ? 28 : 20}
                  className="ml-2"
                />
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
                <IconProps
                  name="chevron"
                  size={selectedMenu === 'achievements' ? 28 : 20}
                  className="ml-2"
                />
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
                <IconProps
                  name="chevron"
                  size={selectedMenu === 'friends' ? 28 : 20}
                  className="ml-2"
                />
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  handleNavigate('login-sessions', '/login-session')
                }
                className={`w-full text-left flex justify-between items-center py-2 px-3 rounded 
                  ${selectedMenu === 'login-sessions' ? 'bg-gray-200 font-bold text-lg' : 'text-gray-500'} 
                  hover:bg-gray-100`}
              >
                Login Sessions
                <IconProps
                  name="chevron"
                  size={selectedMenu === 'login-sessions' ? 28 : 20}
                  className="ml-2"
                />
              </button>
            </li>
          </ul>
        </View>

        {/* Main Content */}
        <View className="flex-1 p-8 border-l border-gray-300 dark:border-gray-600">
          <Text textStyle="regular32" className="mb-4 text-gray-800 text:bold">
            My Profile
          </Text>
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
              <Text>Loading profile data...</Text>
            </div>
          ) : (
            <View className="max-w-2xl">
              <View className="flex items-start gap-8 mb-10">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-100 shadow group"
                  onMouseEnter={() => setShowAvatarMenu(true)}
                  onMouseLeave={() => setShowAvatarMenu(false)}
                >
                  <img
                    src={avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />

                  {/* Hover Menu */}
                  {showAvatarMenu && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center gap-2">
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
                        View
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
                        Change
                      </label>
                    </div>
                  )}

                  {/* Loading Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

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
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newFullName}
                          onChange={handleNameChange}
                          onKeyDown={handleKeyPress}
                          className="w-full p-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                          autoFocus
                          disabled={isSaving}
                        />
                        <div className="absolute right-3 flex gap-3">
                          <button
                            onClick={saveFullName}
                            disabled={isSaving}
                            className="text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditingName}
                            disabled={isSaving}
                            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.full_name}
                          readOnly
                          className="w-full p-2.5 border border-gray-200 rounded-md cursor-default focus:outline-none text-gray-700"
                          placeholder="Full Name"
                        />
                        <button
                          onClick={startEditingName}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
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
                      placeholder="Email"
                    />
                  </View>
                </View>

                <button
                  onClick={() => setShowChangePasswordPopup(true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Change Password
                </button>
              </View>
            </View>
          )}

          <Text textStyle="regular20" className="mb-4 font-semibold">
            Others settings
          </Text>
          <hr className="mb-6 border-gray-300 dark:border-gray-600" />

          <View className="space-y-6">
            <View className="flex items-center justify-between">
              <Text>Language</Text>
              <select className="w-32 p-1 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-200">
                <option>Dropdown</option>
              </select>
            </View>
            <View className="flex items-center justify-between">
              <Text>Theme</Text>
              <button
                onClick={toggleTheme}
                className="w-32 p-1 border border-dark-300 rounded dark:bg-dark-800 dark:text-dark-200 hover:bg-dark-300 dark:hover:bg-dark-600"
              >
                {theme.colors.primary}
              </button>
            </View>
            <View className="flex items-center justify-between">
              <View>
                <Text>Delete my account</Text>
                <Text
                  textStyle="regular12"
                  className="block text-sm text-gray-500 dark:text-gray-400"
                >
                  Permanently delete the account and remove access from all
                  workspaces.
                </Text>
              </View>
              <button className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600">
                Delete
              </button>
            </View>
            <View className="flex justify-end mt-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </View>
          </View>
        </View>
      </View>

      {showChangePasswordPopup && (
        <ChangePasswordPopup
          onClose={() => setShowChangePasswordPopup(false)}
        />
      )}
    </View>
  );
}
