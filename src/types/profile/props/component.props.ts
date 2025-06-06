import React from 'react';
import { ProfileData, UserSession } from '../response/profile.response';

export interface ProfileFormProps {
  profile: ProfileData;
  onUpdateProfile: (fullName: string) => void;
  isSubmitting: boolean;
  error?: string;
}
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
export type ChangePasswordPopupProps = {
  onClose: () => void;
};

export interface AvatarUploadProps {
  avatarUrl?: string;
  onAvatarUpload: (file: File) => void;
  isUploading: boolean;
}

export interface ChangePasswordFormProps {
  onChangePassword: (currentPassword: string, newPassword: string) => void;
  isSubmitting: boolean;
  error?: string;
}

export interface SessionListProps {
  currentSession: UserSession;
  activeSessions: UserSession[];
  previousSessions: UserSession[];
  onLogoutSession: (id: string) => void;
  onLogoutAllSessions: () => void;
  isLoading: boolean;
}

export interface SessionItemProps {
  session: UserSession;
  isCurrent: boolean;
  onLogout: (id: string) => void;
}
