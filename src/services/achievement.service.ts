import api from './api.service';
import { ConditionTypeEnum, Achievement, UserAchievement, UserAchievementWithDetails } from '../types/achievement/achievement.type';
import { toast, Bounce, Slide } from 'react-toastify';
import React from 'react';

interface AchievementResponse {
  total: number;
  achievements: Achievement[];
}

interface UserAchievementResponse {
  total: number;
  achievements: UserAchievementWithDetails[];
}

// Custom component for achievement notifications
const AchievementToast = ({ achievement }: { achievement: Achievement }) => {
  return React.createElement('div', { 
    style: { 
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '18px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      width: '100%',
      maxWidth: '380px',
      margin: '0 auto',
      transform: 'translateY(0)',
      animation: 'fadeIn 0.3s ease-out'
    } 
  }, [
    achievement.icon_url || achievement.badge_image ? 
      React.createElement('div', {
        style: {
          overflow: 'hidden',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f7ff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }
      }, [
        React.createElement('img', { 
          src: achievement.icon_url || achievement.badge_image, 
          alt: 'Achievement Icon',
          style: {
            width: '85%',
            height: '85%',
            objectFit: 'contain'
          }
        })
      ]) : null,
    React.createElement('div', { 
      style: { flex: 1 } 
    }, [
      React.createElement('div', {
        style: {
          fontSize: '11px',
          fontWeight: '600',
          color: '#4CAF50',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }
      }, 'Thành tựu mới'),
      React.createElement('div', { 
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '6px',
          color: '#333333'
        }
      }, achievement.title),
      React.createElement('div', { 
        style: {
          fontSize: '14px',
          color: '#555555',
          lineHeight: '1.5'
        }
      }, achievement.description)
    ])
  ]);
};

// Add global CSS for animation
if (!document.getElementById('achievement-toast-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'achievement-toast-styles';
  styleEl.innerHTML = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .achievement-toast {
      overflow: visible !important;
      background: transparent !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(styleEl);
}

const achievementService = {

  /**
   * Get all achievements that the user has unlocked (đã đạt được)
   */
  getUnlockedAchievements: async () => {
    try {
      const response = await api.get('/productivity/user-achievement/my-achievements/unlocked');
      console.log('API response for unlocked achievements:', response.data);

      // Xử lý cấu trúc response có dạng { total, achievements }
      if (response.data && response.data.data) {
        return response.data.data.achievements || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      return [];
    }
  },

  /**
   * Get all achievements that the user hasn't unlocked yet (chưa đạt được)
   */
  getLockedAchievements: async () => {
    try {
      const response = await api.get('/productivity/user-achievement/my-achievements/locked');
      console.log('API response for locked achievements:', response.data);

      // Xử lý cấu trúc response có dạng { total, achievements }
      if (response.data && response.data.data) {
        return response.data.data.achievements || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching locked achievements:', error);
      return [];
    }
  },

  /**
   * Check and unlock all task-related achievements for a user
   * @returns Array of newly unlocked achievements
   */
  checkTaskAchievements: async () => {
    try {
      const response = await api.post(`/productivity/achievement/check-task-achievements`);
      const newAchievements = response.data.data || [];

      // Hiển thị thông báo nếu có thành tựu mới
      if (newAchievements.length > 0) {
        achievementService.showAchievementNotifications(newAchievements);
      }

      return response.data;
    } catch (error) {
      console.error('Error checking task achievements:', error);
      return { data: [] };
    }
  },

  /**
   * Hiển thị thông báo cho các thành tựu mới
   */
  showAchievementNotifications: (achievements: Achievement[]) => {
    // Hiển thị từng thành tựu riêng biệt
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        toast(
          ({ closeToast }) => AchievementToast({ achievement }),
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Bounce,
            className: 'achievement-toast',
            icon: false,
            style: {
              zIndex: 9999
            }
          }
        );
      }, index * 2000); // Hiển thị lần lượt, cách nhau 2 giây
    });
  }
};

export default achievementService; 