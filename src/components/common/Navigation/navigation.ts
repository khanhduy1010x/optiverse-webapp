import { IconName } from '../../../assets/icons';

export interface NavSection {
  label: string;
  path: string;
  icon?: IconName;
  subsections?: NavSection[];
  parentPath?: string;
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
    label: 'Flash card',
    path: '/flashcard-deck',
    icon: 'flashcard',
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
        label: 'Login Sessions',
        path: '/login-session',
        icon: 'devices',
        parentPath: '/user-profile',
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
  return PATH_MAPPING[path] || path;
};
