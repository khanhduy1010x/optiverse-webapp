import React, { useState } from 'react';
import { UserAchievement } from '../../types/user-achievement/user-achievement.types';
import View from '../common/View.component';
import Button from '../common/Button.component';
import Icon from '../common/Icon/Icon.component';
import RichTextDisplay from '../common/RichTextDisplay.component';
import '../common/RichTextDisplay.style.css';

interface AchievementListProps {
    unlockedAchievements: UserAchievement[];
    lockedAchievements: UserAchievement[];
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
    onClearError: () => void;
}

const AchievementList: React.FC<AchievementListProps> = ({
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    onRefresh,
    onClearError
}) => {
    const [selectedAchievement, setSelectedAchievement] = useState<UserAchievement | null>(null);
    if (loading) {
        return (
            <View className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading achievements...</span>
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-red-800 font-medium">Error loading achievements</h3>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={onClearError}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded"
                        >
                            Dismiss
                        </Button>
                        <Button
                            onClick={onRefresh}
                            className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </View>
        );
    }

    const renderAchievementCard = (achievement: UserAchievement, isUnlocked: boolean) => (
        <div
            key={achievement.achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className={`group relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${isUnlocked
                ? 'bg-white border-gray-300 shadow-sm hover:bg-gray-50'
                : 'bg-gray-50 border-gray-200 shadow-sm opacity-60 hover:opacity-70'
                }`}
        >
            <div className="relative p-4">
                <div className="flex flex-col items-center text-center">
                    {/* Achievement Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${isUnlocked
                        ? 'bg-gray-100'
                        : 'bg-gray-200'
                        }`}>
                        {achievement.achievement.icon_url ? (
                            <img
                                src={achievement.achievement.icon_url}
                                alt={achievement.achievement.title}
                                className="w-7 h-7 object-contain"
                            />
                        ) : (
                            <svg
                                className={`w-7 h-7 ${isUnlocked ? 'text-gray-600' : 'text-gray-500'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9V7H3V9C3 10.66 4.34 12 6 12C7.66 12 9 10.66 9 9V9.5C9 11.43 10.57 13 12.5 13H11.5C13.43 13 15 11.43 15 9.5V9C15 10.66 16.34 12 18 12C19.66 12 21 10.66 21 9ZM12 15C10.9 15 10 15.9 10 17V19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19V17C14 15.9 13.1 15 12 15Z" />
                            </svg>
                        )}
                    </div>

                    {/* Achievement Details */}
                    <div className="w-full">
                        <h3 className={`font-medium text-sm mb-2 text-center ${isUnlocked ? 'text-gray-800' : 'text-gray-500'
                            }`}>
                            {achievement.achievement.title}
                        </h3>

                        {isUnlocked && (
                            <div className="flex justify-center mb-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                    Unlocked
                                </span>
                            </div>
                        )}

                        <div className={`text-xs mb-3 text-center line-clamp-2 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                            <RichTextDisplay 
                                content={achievement.achievement.description || ''} 
                                className="compact"
                                maxLength={60}
                            />
                        </div>

                        {/* Reward section */}
                        {achievement.achievement.reward && (
                            <div className="flex justify-center mb-2">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${isUnlocked
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <span>⭐ {achievement.achievement.reward}</span>
                                </div>
                            </div>
                        )}

                        {/* Unlock date */}
                        {isUnlocked && achievement.unlocked_at && (
                            <div className="flex justify-center">
                                <div className="text-xs text-gray-500">
                                    {new Date(achievement.unlocked_at).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <View className="space-y-8">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center 
                  border border-gray-300 shadow-sm hover:shadow-md transition">
                            <Icon name="trophy" size={22} color="gray" className="translate-x-0.5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Unlocked Achievements
                        </h2>
                    </div>


                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {unlockedAchievements.map((achievement) =>
                            renderAchievementCard(achievement, true)
                        )}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Locked Achievements
                        </h2>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                            {lockedAchievements.length}
                        </span>
                    </div>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {lockedAchievements.map((achievement) =>
                            renderAchievementCard(achievement, false)
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {unlockedAchievements.length === 0 && lockedAchievements.length === 0 && (
                <View className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No achievements found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Start completing tasks and challenges to unlock your first achievement and begin your journey!</p>
                    <Button
                        onClick={onRefresh}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        🔄 Refresh Achievements
                    </Button>
                </View>
            )}

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Close Button - Top Right */}
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6 space-y-6">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-lg">
                                    {selectedAchievement.achievement.icon_url ? (
                                        <img
                                            src={selectedAchievement.achievement.icon_url}
                                            alt={selectedAchievement.achievement.title}
                                            className="w-14 h-14 object-contain"
                                        />
                                    ) : (
                                        <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9V7H3V9C3 10.66 4.34 12 6 12C7.66 12 9 10.66 9 9V9.5C9 11.43 10.57 13 12.5 13H11.5C13.43 13 15 11.43 15 9.5V9C15 10.66 16.34 12 18 12C19.66 12 21 10.66 21 9ZM12 15C10.9 15 10 15.9 10 17V19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19V17C14 15.9 13.1 15 12 15Z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedAchievement.achievement.title}</h2>
                            </div>

                            {/* Description */}
                            {selectedAchievement.achievement.description && (
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        <RichTextDisplay 
                                            content={selectedAchievement.achievement.description} 
                                            className="text-sm"
                                        />
                                    </p>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="h-px bg-gray-200"></div>

                            {/* Reward */}
                            {selectedAchievement.achievement.reward && (
                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                                    <span className="text-sm font-medium text-gray-600">Reward</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">⭐</span>
                                        <span className="text-lg font-semibold text-blue-600">{selectedAchievement.achievement.reward}</span>
                                    </div>
                                </div>
                            )}

                            {/* Unlock Status */}
                            {selectedAchievement.unlocked_at ? (
                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                                    <span className="text-sm font-medium text-gray-600">Unlocked</span>
                                    <span className="text-sm font-semibold text-green-600">{new Date(selectedAchievement.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                                    <span className="text-sm font-medium text-gray-600">Status</span>
                                    <span className="text-sm font-semibold text-gray-500">Locked</span>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedAchievement(null)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </View>
    );
};

export default AchievementList;

