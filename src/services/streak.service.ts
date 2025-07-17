import api from './api.service';
import { StreakResponse } from '../types/streak/streak.types';
import { toast, Bounce } from 'react-toastify';
import StreakToast from '../components/streak/StreakToast';
import React from 'react';

// Add global CSS for animation if not already added
if (typeof document !== 'undefined' && !document.getElementById('streak-toast-styles') && !document.getElementById('achievement-toast-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'streak-toast-styles';
  styleEl.innerHTML = `
    .streak-toast {
      overflow: visible !important;
      background: transparent !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(styleEl);
}

// Define streak types
export type StreakType = 'login' | 'task' | 'flashcard';

// Helper function to extract streak data from response
const extractStreakData = (data: any): any => {
  // Check if data has a nested 'streak' property
  if (data && typeof data === 'object' && 'streak' in data) {
    return data.streak;
  }
  return data;
};

// Helper function to get streak value
const getStreakValue = (streakData: any, type: StreakType): number => {
  if (!streakData) return 0;
  
  const data = extractStreakData(streakData);
  
  switch (type) {
    case 'login':
      return data.loginStreak || 0;
    case 'task':
      return data.taskStreak || 0;
    case 'flashcard':
      return data.flashcardStreak || 0;
    default:
      return 0;
  }
};

const streakService = {
  /**
   * Show streak notification
   */
  showStreakNotification: (streakData: StreakResponse, streakType: StreakType) => {
    // Ensure valid data before showing notification
    if (!streakData) {
      return;
    }
    
    // Pass both streakData and streakType to the component
    toast(
      () => React.createElement(StreakToast, { streakData, streakType }),
      {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Bounce,
        className: 'streak-toast',
        icon: false,
        style: {
          zIndex: 9999
        }
      }
    );
  },

  /**
   * Get user's streak information
   */
  getUserStreak: async (): Promise<StreakResponse | null> => {
    try {
      const response = await api.get('/productivity/streak/user');
      if (response.data && response.data.data) {
        const rawData = response.data.data;
        const streakData = extractStreakData(rawData);
        return streakData;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update login streak
   */
  updateLoginStreak: async (): Promise<StreakResponse | null> => {
    try {
      // Get current streak to compare later
      const currentStreak = await streakService.getUserStreak();
      const previousLoginStreak = getStreakValue(currentStreak, 'login');
      
      const response = await api.post('/productivity/streak/login');
      if (response.data && response.data.data) {
        const rawData = response.data.data;
        const streakData = extractStreakData(rawData);
        
        const newLoginStreak = getStreakValue(streakData, 'login');
        
        // Only show notification if streak actually increased
        if (newLoginStreak > previousLoginStreak) {
          streakService.showStreakNotification(streakData, 'login');
        }
        
        return streakData;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update task streak
   */
  updateTaskStreak: async (): Promise<StreakResponse | null> => {
    try {
      // Get current streak to compare later
      const currentStreak = await streakService.getUserStreak();
      const previousTaskStreak = getStreakValue(currentStreak, 'task');
      
      const response = await api.post('/productivity/streak/task');
      if (response.data && response.data.data) {
        const rawData = response.data.data;
        const streakData = extractStreakData(rawData);
        
        const newTaskStreak = getStreakValue(streakData, 'task');
        
        // Only show notification if streak actually increased
        if (newTaskStreak > previousTaskStreak) {
          streakService.showStreakNotification(streakData, 'task');
        }
       
        return streakData;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update flashcard streak
   */
  updateFlashcardStreak: async (): Promise<StreakResponse | null> => {
    try {
      // Get current streak to compare later
      const currentStreak = await streakService.getUserStreak();
      const previousFlashcardStreak = getStreakValue(currentStreak, 'flashcard');
      
      const response = await api.post('/productivity/streak/flashcard');
      if (response.data && response.data.data) {
        const rawData = response.data.data;
        const streakData = extractStreakData(rawData);
        
        const newFlashcardStreak = getStreakValue(streakData, 'flashcard');
        
        // Only show notification if streak actually increased
        if (newFlashcardStreak > previousFlashcardStreak) {
          streakService.showStreakNotification(streakData, 'flashcard');
        }
        
        return streakData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

export default streakService; 