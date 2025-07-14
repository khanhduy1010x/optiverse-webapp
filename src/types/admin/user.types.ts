export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface User {
  _id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  isVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}
