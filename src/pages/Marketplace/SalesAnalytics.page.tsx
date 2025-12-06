import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import MarketplaceService from '../../services/marketplace.service';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesAnalyticsData {
  totalRevenue: number;
  totalSales: number;
  salesByMonth: Array<{
    _id: { year: number; month: number };
    revenue: number;
    count: number;
  }>;
  topSellingItems: Array<{
    _id: string;
    totalRevenue: number;
    totalSales: number;
    title: string;
    price: number;
  }>;
}

const SalesAnalyticsPage: React.FC = () => {
  const { t } = useAppTranslate('marketplace');
  const [analyticsData, setAnalyticsData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await MarketplaceService.getSalesAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load sales analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Prepare monthly revenue chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyLabels = analyticsData.salesByMonth.map(
    (item) => `${monthNames[item._id.month - 1]} ${item._id.year}`
  );
  const monthlyRevenue = analyticsData.salesByMonth.map((item) => item.revenue);
  const monthlySales = analyticsData.salesByMonth.map((item) => item.count);

  const lineChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Revenue (OP)',
        data: monthlyRevenue,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Sales Count',
        data: monthlySales,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('revenue_trend'),
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Prepare top selling items chart data
  const topItemsLabels = analyticsData.topSellingItems.map((item) => 
    item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title
  );
  const topItemsSales = analyticsData.topSellingItems.map((item) => item.totalSales);

  const barChartData = {
    labels: topItemsLabels,
    datasets: [
      {
        label: 'Total Sales',
        data: topItemsSales,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('top_selling_items'),
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('sales_analytics')}</h1>
        <p className="text-gray-600 mt-2">{t('track_performance')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('total_revenue')}</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {analyticsData.totalRevenue.toLocaleString()} OP
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('total_sales')}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {analyticsData.totalSales}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('average_order_value')}</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {analyticsData.totalSales > 0
                  ? Math.round(analyticsData.totalRevenue / analyticsData.totalSales).toLocaleString()
                  : 0} OP
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Top Selling Items Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Top Selling Items Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('top_selling_details')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('item_title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales_count_header')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('total_revenue_header')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topSellingItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.price.toLocaleString()} OP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.totalSales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {item.totalRevenue.toLocaleString()} OP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;
