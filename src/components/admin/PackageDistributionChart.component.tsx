import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MembershipStats } from '../../types/membership-stats.type';

interface PackageDistributionChartProps {
    packages: MembershipStats[];
}

const PackageDistributionChart: React.FC<PackageDistributionChartProps> = ({
    packages,
}) => {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']; // Extended colors

    const data = packages.map((pkg) => ({
        name: pkg.packageName,
        value: pkg.activeUsers,
        level: pkg.packageLevel,
    }));

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                User Distribution by Package
            </h3>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        labelLine={true}
                        label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} users`} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={80}
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Package Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-16">
                {packages.map((pkg, idx) => (
                    <div key={pkg.packageLevel} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            ></div>
                            <p className="text-xs font-medium text-gray-700 truncate">{pkg.packageName}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{pkg.activeUsers}</p>
                        <p className="text-xs text-gray-600 mt-1">{pkg.percentageOfTotal}% of total</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackageDistributionChart;
