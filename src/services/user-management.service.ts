import { ApiResponse } from '../types/api/api.interface';
import { User } from '../types/admin/user.types';
import apiService from './api.service';

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  totalPages: number;
}

class UserManagementService {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return (await apiService.get('/core/users')).data;
  }

  async getPaginatedUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string
  ): Promise<ApiResponse<PaginatedUsersResponse>> {
    let url = `/core/users/paginated?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (role && role !== 'all') {
      url += `&role=${encodeURIComponent(role)}`;
    }
    if (status && status !== 'all') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    return (await apiService.get(url)).data;
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return await apiService.get(`/core/users/${userId}`);
  }

  async suspendUser(userId: string): Promise<ApiResponse<User>> {
    return await apiService.post(`/core/users/${userId}/suspend`);
  }

  async activateUser(userId: string): Promise<ApiResponse<User>> {
    return await apiService.post(`/core/users/${userId}/activate`);
  }

  async changeUserRole(
    userId: string,
    role: string
  ): Promise<ApiResponse<User>> {
    return await apiService.post(`/core/users/${userId}/change-role`, { role });
  }
}

export const userManagementService = new UserManagementService();
