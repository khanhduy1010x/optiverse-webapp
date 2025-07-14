import { User, UserRole, UserStatus } from './user.types';

export interface UserModalState {
  isOpen: boolean;
  user: User | null;
  loading: boolean;
  actionLoading: boolean;
}

export interface UserModalActions {
  openModal: (user: User) => void;
  closeModal: () => void;
  suspendUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  changeUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export interface UserModalHook extends UserModalState, UserModalActions {}
