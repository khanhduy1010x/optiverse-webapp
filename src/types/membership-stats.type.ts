import React from 'react';

export interface MembershipStats {
  packageLevel: number;
  packageName: string;
  activeUsers: number;
  expiredUsers: number;
  cancelledUsers: number;
  totalRevenue: number;
  newSubscribers: number;
  expiringSubscribers: number;
  percentageOfTotal: number;
}

export interface StatsPeriod {
  month: string;
  revenue: number;
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
      packageLevel: 0,
      packageName: 'BASIC',
      activeUsers: 150,
      expiredUsers: 45,
      cancelledUsers: 20,
      totalRevenue: 1500000, // VND
      newSubscribers: 25,
      expiringSubscribers: 12,
      percentageOfTotal: 60,
    },
    {
      packageLevel: 1,
      packageName: 'PLUS',
      activeUsers: 80,
      expiredUsers: 25,
      cancelledUsers: 8,
      totalRevenue: 1920000, // VND
      newSubscribers: 10,
      expiringSubscribers: 5,
      percentageOfTotal: 32,
    },
    {
      packageLevel: 2,
      packageName: 'BUSINESS',
      activeUsers: 20,
      expiredUsers: 5,
      cancelledUsers: 2,
      totalRevenue: 1000000, // VND
      newSubscribers: 3,
      expiringSubscribers: 1,
      percentageOfTotal: 8,
    },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 3500000, activeUsers: 200, newSubscribers: 30 },
    { month: 'Feb', revenue: 3800000, activeUsers: 210, newSubscribers: 35 },
    { month: 'Mar', revenue: 4200000, activeUsers: 230, newSubscribers: 40 },
    { month: 'Apr', revenue: 4100000, activeUsers: 235, newSubscribers: 38 },
    { month: 'May', revenue: 4500000, activeUsers: 250, newSubscribers: 45 },
    { month: 'Jun', revenue: 4800000, activeUsers: 260, newSubscribers: 48 },
    { month: 'Jul', revenue: 5100000, activeUsers: 280, newSubscribers: 52 },
    { month: 'Aug', revenue: 5300000, activeUsers: 290, newSubscribers: 55 },
    { month: 'Sep', revenue: 5500000, activeUsers: 305, newSubscribers: 60 },
    { month: 'Oct', revenue: 5200000, activeUsers: 300, newSubscribers: 58 },
    { month: 'Nov', revenue: 5400000, activeUsers: 315, newSubscribers: 62 },
    { month: 'Dec', revenue: 4800000, activeUsers: 250, newSubscribers: 48 },
  ],
  totalRevenue: 4420000,
  totalActiveUsers: 250,
  newSubscribers7Days: 38,
  expiringSubscribers7Days: 18,
};
