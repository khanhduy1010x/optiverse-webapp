export const GLOBAL_STYLES = {
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
} as const;

// Thêm CSS cho hiệu ứng đang nhập
export const typingAnimationStyles = `
  .typing-animation {
    display: inline-flex;
  }
  
  .typing-animation span {
    animation: typingDot 1.4s infinite;
    animation-fill-mode: both;
    margin: 0 2px;
  }
  
  .typing-animation span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-animation span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typingDot {
    0% {
      opacity: 0.2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;

// CSS cho animation đếm ngược
export const countdownAnimationStyles = `
  @keyframes countdown {
    0% {
      width: 100%;
    }
    100% {
      width: 0%;
    }
  }
  
  .animate-countdown {
    animation: countdown 5s linear forwards;
  }
`;
