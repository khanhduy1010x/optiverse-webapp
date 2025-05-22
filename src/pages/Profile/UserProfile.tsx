import React from 'react';
import View from '../../components/common/View';
import Text from '../../components/common/Text';
import Input from '../../components/common/Input';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../components/common/Icon/Icon';


export default function UserProfile() {
  const { themeType, toggleTheme } = useTheme();

  return (
    <View className="w-full h-full border border-gray-300 dark:border-gray-700">
      <View className="p-6">
        <Text
          title="MyProfile"
          textStyle="bold24"
          className="mb-4 text-gray-800 dark:text-gray-200"
        />
        <hr className="border-gray-300 dark:border-gray-700 mb-6" />
        
        <View className="flex items-start">
          {/* Profile picture */}
          <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-blue-400 flex items-center justify-center mr-8">
            {/* Empty avatar */}
          </View>
          
          <View className="flex-1">
            {/* Name and edit section */}
            <View className="flex items-center mb-4">
              <Input
                label="Fullname"
                placeholder="Enter your full name"
                className="w-64"
              />
              <button className="ml-4 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </View>
            
            {/* Email field */}
            <View className="flex items-center mb-4">
              <Input
                label="Email"
                placeholder="Enter your email"
                className="w-64"
              />
            </View>
          </View>
          
          {/* Change password button */}
          <button className="bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Text title="ChangePassword" textStyle="regular16" />
          </button>
        </View>
      </View>
      
      <View className="p-6">
        <Text
          title="OthersSettings"
          textStyle="bold20"
          className="mb-4 text-gray-800 dark:text-gray-200"
        />
        <hr className="border-gray-300 dark:border-gray-700 mb-6" />
        
        {/* Language setting */}
        <View className="flex items-center justify-between mb-6">
          <Text
            title="Language"
            textStyle="regular16"
            className="font-medium text-gray-800 dark:text-gray-200"
          />
          <View className="bg-gray-200 dark:bg-gray-700 py-1 px-4 rounded w-32 text-center text-gray-800 dark:text-gray-200">
            <Text title="Dropdown" textStyle="regular12" />
          </View>
        </View>
        
        {/* Theme setting */}
        <View className="flex items-center justify-between mb-6">
          <Text
            title="Theme"
            textStyle="regular16"
            className="font-medium text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 py-1 px-4 rounded w-32 text-center text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icon
              name="themeMode"
              size={16}
              transparent={true}
              className="text-gray-800 dark:text-gray-200"
            />
            <Text title={themeType === 'light' ? 'Light' : 'Dark'} textStyle="regular12" />
          </button>
        </View>
        
        {/* Delete account */}
        <View className="flex items-center justify-between mb-6">
          <View>
            <Text
              title="DeleteMyAccount"
              textStyle="regular16"
              className="font-medium text-gray-800 dark:text-gray-200"
            />
            <Text
              title="DeleteAccountDescription"
              textStyle="regular12"
              className="text-sm text-gray-600 dark:text-gray-400"
            />
          </View>
          <button className="bg-gray-200 dark:bg-gray-700 py-1 px-4 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Text title="Delete" textStyle="regular12" />
          </button>
        </View>
      </View>
    </View>
  );
}