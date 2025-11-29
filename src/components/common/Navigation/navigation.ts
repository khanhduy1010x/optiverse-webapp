import { IconName } from '../../../assets/icons';

export interface NavSection {
  label: string;
  path: string;
  icon?: IconName;
  subsections?: NavSection[];
  parentPath?: string;
  adminOnly?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Task', path: '/task', icon: 'task' },
  { label: 'Note', path: '/note', icon: 'note' },
  {
    label: 'Focus Timer',
    icon: 'timer',
    path: '/focus-timer',
    subsections: [
      {
        label: 'Timer',
        path: '/focus-timer',
        icon: 'timer',
        parentPath: '/focus-timer',
      },
      {
        label: 'Manage',
        path: '/focus-timer/manage',
        icon: 'timer',
        parentPath: '/focus-timer',
      },
      {
        label: 'Statistics',
        path: '/focus-timer/statistics',
        icon: 'timer',
        parentPath: '/focus-timer',
      },
    ],
  },
  {
    label: 'Flashcard',
    path: '/flashcard-deck',
    icon: 'flashcard',
    subsections: [
      {
        label: 'Flash card',
        path: '/flashcard-deck',
        icon: 'flashcard',
        parentPath: '/flashcard-deck',
      },
      {
        label: 'Flashcard list',
        path: '/flashcard-deck/:deckId',
        icon: 'flashcard',
        parentPath: '/flashcard-deck',
      },
      {
        label: 'Add flashcard',
        path: '/flashcard-deck/:deckId/add',
        icon: 'flashcard',
        parentPath: '/flashcard-deck',
      },
      {
        label: 'Learn flashcard',
        path: '/flashcard-deck/:deckId/learn',
        icon: 'flashcard',
        parentPath: '/flashcard-deck',
      },
      {
        label: 'Statistic',
        path: '/flashcard-statistic',
        icon: 'flashcard',
        parentPath: '/flashcard-deck',
      },
    ],
  },
  // { label: 'Setting', path: '/settings', icon: 'setting' },
  {
    label: 'Blog',
    path: '/blog',
    icon: 'blog',
    subsections: [
      {
        label: 'Trang chủ Blog',
        path: '/blog',
        icon: 'blog',
        parentPath: '/blog',
      },
      {
        label: 'Bài viết đã lưu',
        path: '/blog/bookmarks',
        icon: 'star',
        parentPath: '/blog',
      },
      {
        label: 'Bài viết bị tố cáo',
        path: '/blog/reports',
        icon: 'flag',
        parentPath: '/blog',
        adminOnly: true,
      },
    ],
  },
  { label: 'Friend', path: '/friends', icon: 'group' },
  { label: 'Chat', path: '/chat', icon: 'message' },

  {
    label: 'User Profile',
    path: '/user-profile',
    icon: 'profile',
    subsections: [
      {
        label: 'Profile',
        path: '/user-profile',
        icon: 'profile',
        parentPath: '/user-profile',
      },
      {
        label: 'Notification Settings',
        path: '/notifications',
        icon: 'notification',
        parentPath: '/user-profile',
      },
      {
        label: 'Login Sessions',
        path: '/login-session',
        icon: 'devices',
        parentPath: '/user-profile',
      },
      {
        label: 'Achievements',
        path: '/user-achievements',
        icon: 'trophy',
        parentPath: '/user-profile',
      },
      {
        label: 'Payment History',
        path: '/payment-history',
        icon: 'calendar',
        parentPath: '/user-profile',
      },
    ],
  },
  {
    label: 'Admin',
    path: '/admin/dashboard',
    icon: 'admin',
    adminOnly: true,
    subsections: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'home',
        parentPath: '/admin/dashboard',
      },
      {
        label: 'MPs Management',
        path: '/admin/users',
        icon: 'mps',
        parentPath: '/admin/dashboard',
      },
      {
        label: 'System Settings',
        path: '/admin/settings',
        icon: 'setting',
        parentPath: '/admin/dashboard',
      },
      {
        label: 'Achievements',
        path: '/admin/achievements',
        icon: 'trophy',
        parentPath: '/admin/dashboard',
      },
    ],
  },
];

// Optional dynamic extension for workspace context (used by Sidebar)
export const WORKSPACE_ONLY_SECTIONS: NavSection[] = [
  { label: 'Members', path: '/workspace-focus-rooms', icon: 'group' },
];

// Dedicated minimal navigation for Marketplace context
export const MARKETPLACE_SECTIONS: NavSection[] = [
  { label: 'Home', path: '/marketplace', icon: 'home' },
  {
    label: 'My Items',
    path: '/marketplace/my-items',
    icon: 'add_market',
  },

  // { label: 'Purchase History', path: '/marketplace/purchase-history', icon: 'calendar' },
  {
    label: 'Favorites',
    path: '/marketplace/favorites',
    icon: 'heart',
  },
  {
    label: 'Purchase History',
    path: '/marketplace/purchase-history',
    icon: 'calendar',
  },

  {
    label: 'Analytics',
    path: '/marketplace/analytics',
    icon: 'analytics',
  },
  { label: 'Leaderboard', path: '/marketplace/leaderboard', icon: 'trophy' },
    {
    label: 'Followers',
    path: '/marketplace/followers',
    icon: 'follow',
  },
];

// Map các path con tới path cha để dễ dàng tìm kiếm
const PATH_MAPPING: Record<string, string> = {
  '/focus-timer': '/focus-timer',
  '/focus-timer/manage': '/focus-timer',
  '/focus-timer/statistics': '/focus-timer',
  '/user-profile': '/user-profile',
  '/login-session': '/user-profile',
  '/notifications': '/user-profile',
  '/flashcard-statistic': '/flashcard-deck',
  '/flashcard-deck': '/flashcard-deck',
  '/task-statistic': '/task',
  '/user-achievements': '/user-profile',
  '/payment-history': '/user-profile',
  '/blog': '/blog',
  '/blog/create': '/blog',
  '/blog/edit': '/blog',
  '/blog/post': '/blog',
  '/blog/category': '/blog',
  '/blog/bookmarks': '/blog',
  '/blog/reports': '/blog',
  '/admin/dashboard': '/admin/dashboard',
  '/admin/users': '/admin/dashboard',
  '/admin/settings': '/admin/dashboard',
  '/admin/achievements': '/admin/dashboard',
  '/marketplace': '/marketplace',
  // Marketplace sections: map each sub-route to itself for correct active highlighting
  '/marketplace/favorites': '/marketplace/favorites',
  '/marketplace/followers': '/marketplace/followers',
  '/marketplace/analytics': '/marketplace/analytics',
  '/marketplace/my-items': '/marketplace/my-items',
  '/marketplace/purchase-history': '/marketplace/purchase-history',
  '/marketplace/leaderboard': '/marketplace/leaderboard',
  '/leaderboard': '/leaderboard',
};

export const getSectionKeyFromPath = (path: string): string => {
  // Kiểm tra xem path có trong mapping không
  const parentPath = PATH_MAPPING[path];
  if (parentPath) {
    return parentPath;
  }

  // Kiểm tra xem path có trùng với section nào không
  const section = NAV_SECTIONS.find(section => section.path === path);
  if (section) return section.path;

  // Tìm kiếm trong các subsection
  for (const parent of NAV_SECTIONS) {
    if (parent.subsections) {
      const subsection = parent.subsections.find(sub => sub.path === path);
      if (subsection) {
        // Trả về path của section cha thay vì section con
        return subsection.parentPath || parent.path;
      }
    }
  }

  return '/dashboard'; // Mặc định
};

// Hàm mới để lấy path hiện tại cho sidebar chính
export const getMainSidebarActiveSection = (path: string): string => {
  // Strip workspace prefix: /workspace/:id
  if (path.startsWith('/workspace/')) {
    const withoutWs = path.replace(/^\/workspace\/[^/]+/, '') || '/dashboard';
    path = withoutWs;
  }
  if (PATH_MAPPING[path]) return PATH_MAPPING[path];

  const matchingPrefix = Object.keys(PATH_MAPPING).find(key =>
    path.startsWith(key + '/')
  );

  if (matchingPrefix) return PATH_MAPPING[matchingPrefix];

  return path;
};
