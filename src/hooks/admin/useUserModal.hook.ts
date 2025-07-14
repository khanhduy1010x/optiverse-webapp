import { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types/admin/user.types';
import { UserModalHook } from '../../types/admin/user-modal.types';
import { userManagementService } from '../../services/user-management.service';
import { toast } from 'react-toastify';

export const useUserModal = (onUserUpdated?: () => void): UserModalHook => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const openModal = (userData: User) => {
    setUser(userData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setUser(null);
    setActionLoading(false);
  };

  const suspendUser = async (userId: string) => {
    try {
      setActionLoading(true);
      await userManagementService.suspendUser(userId);
      toast.success('User account suspended successfully');

      // Update user data in modal
      if (user && user._id === userId) {
        setUser({ ...user, status: UserStatus.SUSPENDED });
      }

      onUserUpdated?.();
    } catch (err) {
      toast.error('Failed to suspend user account');
    } finally {
      setActionLoading(false);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      setActionLoading(true);
      await userManagementService.activateUser(userId);
      toast.success('User account activated successfully');

      // Update user data in modal
      if (user && user._id === userId) {
        setUser({ ...user, status: UserStatus.ACTIVE });
      }

      onUserUpdated?.();
    } catch (err) {
      toast.error('Failed to activate user account');
    } finally {
      setActionLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setActionLoading(true);
      await userManagementService.changeUserRole(userId, newRole);
      toast.success(`User role changed to ${newRole} successfully`);

      // Update user data in modal
      if (user && user._id === userId) {
        setUser({ ...user, role: newRole });
      }

      onUserUpdated?.();
    } catch (err) {
      toast.error('Failed to change user role');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    isOpen,
    user,
    loading,
    actionLoading,
    openModal,
    closeModal,
    suspendUser,
    activateUser,
    changeUserRole,
  };
};
