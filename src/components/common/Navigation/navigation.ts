import { IconName } from '../../../assets/icons';

export interface NavSection {
  label: string;
  path: string;
  icon?: IconName;
  subsections?: NavSection[];
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
      { label: 'Manage ', path: '/manage-focus-timer', icon: 'timer' },
      { label: 'Timer', path: '/focus-timer', icon: 'timer' },
      { label: 'Statistics ', path: '/statistics-timer', icon: 'timer' },
    ],
  },
  {
    label: 'Flash card',
    path: '/flashcard-deck',
    icon: 'flashcard',
  },
  // { label: 'Setting', path: '/settings', icon: 'setting' },
  { label: 'Friend', path: '/friends', icon: 'friend' },

  { label: 'User Profile', path: '/user-profile', icon: 'star' },
];

export const getSectionKeyFromPath = (path: string): string => {
  const section = NAV_SECTIONS.find(section => section.path === path);
  if (section) return section.path || 'dashboard';

  for (const parent of NAV_SECTIONS) {
    if (parent.subsections) {
      const subsection = parent.subsections.find(sub => sub.path === path);
      if (subsection) return subsection.path || 'dashboard';
    }
  }

  return '/dashboard'; // Mặc định
};
