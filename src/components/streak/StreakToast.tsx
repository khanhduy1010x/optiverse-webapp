import React from 'react';
import { StreakResponse } from '../../types/streak/streak.types';
import { toast, Bounce } from 'react-toastify';
import { StreakType } from '../../services/streak.service';

interface StreakToastProps {
  streakData: StreakResponse;
  streakType?: StreakType; // Optional to maintain compatibility with old code
}

// Helper function to get streak display info based on count
const getStreakDisplayInfo = (count: number) => {
  let emoji = '🔥';
  let bgColor = '#fff3e0';
  let accentColor = '#FF9800';
  let message = 'Keep maintaining your streak!';
  
  if (count >= 30) {
    emoji = '🏆';
    bgColor = '#e3f2fd';
    accentColor = '#2196F3';
    message = 'Impressive achievement! You\'ve maintained an excellent habit!';
  } else if (count >= 14) {
    emoji = '⭐';
    bgColor = '#e8f5e9';
    accentColor = '#4CAF50';
    message = 'Great job! You\'re building a sustainable habit!';
  } else if (count >= 7) {
    emoji = '✨';
    bgColor = '#fff8e1';
    accentColor = '#FFC107';
    message = 'Impressive! Keep your streak going!';
  }
  
  return { emoji, bgColor, accentColor, message };
};

// Function to show a streak toast notification with count and type
export const showStreakToast = (count: number, type: StreakType) => {
  let title = '';
  const { emoji, bgColor, accentColor, message } = getStreakDisplayInfo(count);
  
  switch (type) {
    case 'login':
      title = `${count} day login streak!`;
      break;
    case 'task':
      title = `${count} day task completion streak!`;
      break;
    case 'flashcard':
      title = `${count} day flashcard study streak!`;
      break;
  }
  
  toast(
    () => (
      <div style={{ 
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
      }}>
        <div style={{
          overflow: 'hidden',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: accentColor
          }}>
            {emoji}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Activity Streak
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '6px',
            color: '#333333'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#555555',
            lineHeight: '1.5'
          }}>
            {message}
          </div>
        </div>
      </div>
    ),
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
};

const StreakToast: React.FC<StreakToastProps> = ({ streakData, streakType }) => {
  const getStreakInfo = () => {
    // If streakType is provided, use it to determine the streak type
    if (streakType) {
      // Access properties directly from streakData
      if (streakData && typeof streakData === 'object') {
        // Check if there's a nested structure (streak might be a child property)
        const data = 'streak' in streakData ? (streakData.streak as any) : streakData;
        
        let count = 0;
        let title = '';
        
        switch (streakType) {
          case 'login':
            count = data.loginStreak || 0;
            title = `${count} day login streak!`;
            break;
          case 'task':
            count = data.taskStreak || 0;
            title = `${count} day task completion streak!`;
            break;
          case 'flashcard':
            count = data.flashcardStreak || 0;
            title = `${count} day flashcard study streak!`;
            break;
        }
        
        if (count > 1) {
          const { emoji, bgColor, accentColor, message } = getStreakDisplayInfo(count);
          return { title, emoji, bgColor, accentColor, message };
        }
      }
    } 
    // If no streakType is provided, use the old logic
    else if (streakData && typeof streakData === 'object') {
      // Check if there's a nested structure (streak might be a child property)
      const data = 'streak' in streakData ? (streakData.streak as any) : streakData;
      
      if (data.loginStreak && data.loginStreak > 1) {
        const title = `${data.loginStreak} day login streak!`;
        const { emoji, bgColor, accentColor, message } = getStreakDisplayInfo(data.loginStreak);
        return { title, emoji, bgColor, accentColor, message };
      } else if (data.taskStreak && data.taskStreak > 1) {
        const title = `${data.taskStreak} day task completion streak!`;
        const { emoji, bgColor, accentColor, message } = getStreakDisplayInfo(data.taskStreak);
        return { title, emoji, bgColor, accentColor, message };
      } else if (data.flashcardStreak && data.flashcardStreak > 1) {
        const title = `${data.flashcardStreak} day flashcard study streak!`;
        const { emoji, bgColor, accentColor, message } = getStreakDisplayInfo(data.flashcardStreak);
        return { title, emoji, bgColor, accentColor, message };
      }
    }
    
    // Fallback if no valid streak data is found
    return { 
      title: 'New Activity Streak!', 
      emoji: '🔥', 
      bgColor: '#fff3e0', 
      accentColor: '#FF9800',
      message: 'Keep maintaining your streak!'
    };
  };

  const { title, emoji, bgColor, accentColor, message } = getStreakInfo();

  return (
    <div style={{ 
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
    }}>
      <div style={{
        overflow: 'hidden',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: accentColor
        }}>
          {emoji}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '600',
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          Activity Streak
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '6px',
          color: '#333333'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#555555',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
      </div>
    </div>
  );
};

// Add global CSS for animation if not already added
if (typeof document !== 'undefined' && !document.getElementById('streak-toast-styles') && !document.getElementById('achievement-toast-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'streak-toast-styles';
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
    
    .streak-toast {
      overflow: visible !important;
      background: transparent !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(styleEl);
}

export default StreakToast; 