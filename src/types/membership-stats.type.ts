import React from 'react';

export interface MembershipStats {
  packageId: string;
  packageName: string;
  packageLevel: number;
  level: number;
  activeUsers: number;
  expiredUsers: number;
  cancelledUsers: number;
  revenue: number;
  totalRevenue: number;
  newSubscribers: number;
  expiringSubscribers: number;
  percentageOfTotal: number;
  averageDuration: number;
  conversionRate: number;
}

export interface StatsPeriod {
  month: string;
  revenue: number;
  subscribers: number;
  activeUsers: number;
  newSubscribers: number;
}

export interface DashboardStats {
  packages: MembershipStats[];
  monthlyRevenue: StatsPeriod[];
  totalRevenue: number;
  totalActiveUsers: number;
  newSubscribers7Days: number;
  expiringSubscribers7Days: number;
}

// Mock data - sẽ replace bằng data từ BE
export const mockDashboardStats: DashboardStats = {
  packages: [
    {
      packageId: 'pkg-001',
      packageLevel: 0,
      packageName: 'BASIC',
      level: 0,
      activeUsers: 150,
      expiredUsers: 45,
      cancelledUsers: 20,
      revenue: 1500000,
      totalRevenue: 1500000, // VND
      newSubscribers: 25,
      expiringSubscribers: 12,
      percentageOfTotal: 60,
      averageDuration: 30,
      conversionRate: 85,
    },
    {
      packageId: 'pkg-002',
      packageLevel: 1,
      packageName: 'PLUS',
      level: 1,
      activeUsers: 80,
      expiredUsers: 25,
      cancelledUsers: 8,
      revenue: 1920000,
      totalRevenue: 1920000, // VND
      newSubscribers: 10,
      expiringSubscribers: 5,
      percentageOfTotal: 32,
      averageDuration: 60,
      conversionRate: 90,
    },
    {
      packageId: 'pkg-003',
      packageLevel: 2,
      packageName: 'BUSINESS',
      level: 2,
      activeUsers: 20,
      expiredUsers: 5,
      cancelledUsers: 2,
      revenue: 1000000,
      totalRevenue: 1000000, // VND
      newSubscribers: 3,
      expiringSubscribers: 1,
      percentageOfTotal: 8,
      averageDuration: 90,
      conversionRate: 95,
    },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 3500000, subscribers: 200, activeUsers: 200, newSubscribers: 30 },
    { month: 'Feb', revenue: 3800000, subscribers: 210, activeUsers: 210, newSubscribers: 35 },
    { month: 'Mar', revenue: 4200000, subscribers: 230, activeUsers: 230, newSubscribers: 40 },
    { month: 'Apr', revenue: 4100000, subscribers: 235, activeUsers: 235, newSubscribers: 38 },
    { month: 'May', revenue: 4500000, subscribers: 250, activeUsers: 250, newSubscribers: 45 },
    { month: 'Jun', revenue: 4800000, subscribers: 260, activeUsers: 260, newSubscribers: 48 },
    { month: 'Jul', revenue: 5100000, subscribers: 280, activeUsers: 280, newSubscribers: 52 },
    { month: 'Aug', revenue: 5300000, subscribers: 290, activeUsers: 290, newSubscribers: 55 },
    { month: 'Sep', revenue: 5500000, subscribers: 305, activeUsers: 305, newSubscribers: 60 },
    { month: 'Oct', revenue: 5200000, subscribers: 300, activeUsers: 300, newSubscribers: 58 },
    { month: 'Nov', revenue: 5400000, subscribers: 315, activeUsers: 315, newSubscribers: 62 },
    { month: 'Dec', revenue: 4800000, subscribers: 250, activeUsers: 250, newSubscribers: 48 },
  ],
  totalRevenue: 4420000,
  totalActiveUsers: 250,
  newSubscribers7Days: 38,
  expiringSubscribers7Days: 18,
};
