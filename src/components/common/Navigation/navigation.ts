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
        label: 'Manage ',
        path: '/manage-focus-timer',
        icon: 'timer',
        parentPath: '/focus-timer',
      },
      {
        label: 'Timer',
        path: '/focus-timer',
        icon: 'timer',
        parentPath: '/focus-timer',
      },
      {
        label: 'Statistics ',
        path: '/statistics-timer',
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
  { label: 'Friend', path: '/friends', icon: 'friend' },
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
        path: '/achievements',
        icon: 'trophy',
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
        label: 'User Management',
        path: '/admin/users',
        icon: 'group',
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

// Map các path con tới path cha để dễ dàng tìm kiếm
const PATH_MAPPING: Record<string, string> = {
  '/manage-focus-timer': '/focus-timer',
  '/focus-timer': '/focus-timer',
  '/statistics-timer': '/focus-timer',
  '/user-profile': '/user-profile',
  '/login-session': '/user-profile',
  '/notifications': '/user-profile',
  '/flashcard-statistic': '/flashcard-deck',
  '/flashcard-deck': '/flashcard-deck',
  '/achievements': '/user-profile',
  '/admin/dashboard': '/admin/dashboard',
  '/admin/users': '/admin/dashboard',
  '/admin/settings': '/admin/dashboard',
  '/admin/achievements': '/admin/dashboard',
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
  if (PATH_MAPPING[path]) return PATH_MAPPING[path];

  const matchingPrefix = Object.keys(PATH_MAPPING).find(key =>
    path.startsWith(key + '/')
  );

  if (matchingPrefix) return PATH_MAPPING[matchingPrefix];

  return path;
};
