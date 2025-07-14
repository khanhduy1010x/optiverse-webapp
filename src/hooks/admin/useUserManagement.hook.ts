import { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../../types/admin/user.types';
import { userManagementService } from '../../services/user-management.service';
import { toast } from 'react-toastify';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const fetchPaginatedUsers = async (
    pageNumber: number = page,
    pageLimit: number = limit,
    search: string = searchTerm,
    role: string = roleFilter,
    status: string = statusFilter
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userManagementService.getPaginatedUsers(
        pageNumber,
        pageLimit,
        search,
        role,
        status
      );
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.total);
      setPage(pageNumber);
    } catch (err) {
      setError('Error loading user list');
      toast.error('Could not load user list');
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchPaginatedUsers(newPage, limit, searchTerm, roleFilter, statusFilter);
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    fetchPaginatedUsers(1, newLimit, searchTerm, roleFilter, statusFilter);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchPaginatedUsers(1, limit, term, roleFilter, statusFilter);
  };

  const handleRoleFilterChange = (role: UserRole | 'all') => {
    setRoleFilter(role);
    fetchPaginatedUsers(1, limit, searchTerm, role, statusFilter);
  };

  const handleStatusFilterChange = (status: UserStatus | 'all') => {
    setStatusFilter(status);
    fetchPaginatedUsers(1, limit, searchTerm, roleFilter, status);
  };

  const suspendUser = async (userId: string) => {
    try {
      setLoading(true);
      await userManagementService.suspendUser(userId);
      toast.success('User account suspended');
      await fetchPaginatedUsers(1, limit, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      toast.error('Could not suspend user account');
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      setLoading(true);
      await userManagementService.activateUser(userId);
      toast.success('User account activated');
      await fetchPaginatedUsers(1, limit, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      toast.error('Could not activate user account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedUsers(1, limit, searchTerm, roleFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalUsers,
    searchTerm,
    roleFilter,
    statusFilter,
    fetchPaginatedUsers,
    changePage,
    changeLimit,
    handleSearch,
    handleRoleFilterChange,
    handleStatusFilterChange,
    suspendUser,
    activateUser,
  };
};
