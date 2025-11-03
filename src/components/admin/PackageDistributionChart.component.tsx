import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MembershipStats } from '../../types/membership-stats.type';

interface PackageDistributionChartProps {
    packages: MembershipStats[];
}

const PackageDistributionChart: React.FC<PackageDistributionChartProps> = ({
    packages,
}) => {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6']; // Amber, Green, Blue

    const data = packages.map((pkg) => ({
        name: `${pkg.packageName} (${pkg.activeUsers})`,
        value: pkg.activeUsers,
        level: pkg.packageLevel,
    }));

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                User Distribution by Package
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} users`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Package Summary */}
            <div className="grid grid-cols-3 gap-4 mt-8">
                {packages.map((pkg, idx) => (
                    <div key={pkg.packageLevel} className="p-4 bg-gray-50 rounded-lg">
                        <div
                            className="w-3 h-3 rounded-full mb-2 inline-block"
                            style={{ backgroundColor: COLORS[idx] }}
                        ></div>
                        <p className="text-sm font-medium text-gray-700">{pkg.packageName}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{pkg.activeUsers}</p>
                        <p className="text-xs text-gray-600 mt-1">{pkg.percentageOfTotal}% of total</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackageDistributionChart;
