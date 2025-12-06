import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Icon from '../../components/common/Icon/Icon.component';
import MembershipPackageCard from '../../components/admin/MembershipPackageCard.component';
import MembershipPackageTable from '../../components/admin/MembershipPackageTable.component';
import MembershipStatsDashboard from '../../screens/admin/MembershipStatsDashboard.screen';
import CreateMembershipPackageForm, {
  CreatePackageData,
} from '../../components/admin/CreateMembershipPackageForm.component';
import membershipPackageService, { MembershipPackage } from '../../services/membership-package.service';

type ViewMode = 'card' | 'table';
type TabMode = 'management' | 'create' | 'statistics';

const MpsManagement: React.FC = () => {
  const { t } = useAppTranslate('admin');
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [tabMode, setTabMode] = useState<TabMode>('management');

  // Fetch membership packages on mount
  useEffect(() => {
    fetchMembershipPackages();
  }, []);

  const fetchMembershipPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipPackageService.getAllMembershipPackages();
      setPackages(data || []);
    } catch (err) {
      console.error('Error fetching membership packages:', err);
      setError(t('failed_to_load_membership_packages'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: MembershipPackage) => {
    console.log('Edit package:', pkg);
    // TODO: Open edit modal
  };

  const handleDelete = async (level: number) => {
    if (!window.confirm(t('are_you_sure_deactivate_package'))) {
      return;
    }

    try {
      await membershipPackageService.deactivateMembershipPackage(level);
      // Refresh packages list
      await fetchMembershipPackages();
      toast.success(t('membership_package_deactivated_successfully'));
    } catch (err: any) {
      console.error('Error deleting package:', err);
      const errorMessage = err?.response?.data?.message || t('failed_to_delete_membership_package');
      toast.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  };

  const handleCreatePackage = async (data: CreatePackageData) => {
    try {
      setError(null);
      await membershipPackageService.createMembershipPackage({
        name: data.name,
        description: data.description,
        price: data.price,
        duration_days: data.duration_days,
        level: data.level,
        opBonusCredits: data.opBonusCredits,
        is_active: true,
      });
      // Refresh packages list and go back to management
      await fetchMembershipPackages();
      setTabMode('management');
      // Show success toast
      toast.success(t('membership_package_created_successfully'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      console.error('Error creating package:', err);
      const errorMessage = err?.response?.data?.message || t('failed_to_create_membership_package');
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      setError(errorMessage);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-57px)] flex flex-col">
      {/* Fixed Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('membership_packages_management')}
          </h1>
          <p className="text-gray-600">
            {t('manage_configure_membership_packages')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-0">
          <button
            onClick={() => setTabMode('management')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${tabMode === 'management'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            {t('package_management')}
          </button>
          <button
            onClick={() => setTabMode('create')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${tabMode === 'create'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            {t('create_package')}
          </button>
          <button
            onClick={() => setTabMode('statistics')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${tabMode === 'statistics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            {t('statistics_analytics')}
          </button>
        </div>
      </div>

      {/* Management Tab - Fixed View Toggle */}
      {tabMode === 'management' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* View Mode Toggle - Fixed */}
          <div className="mb-6 flex items-center gap-3 flex-shrink-0 bg-white">
            <span className="text-sm font-medium text-gray-700">{t('view')}</span>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                title="Card View"
              >
                <Icon name="description" size={16} />
                <span>{t('card')}</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                title="Table View"
              >
                <Icon name="statistic" size={16} />
                <span>{t('table')}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading membership packages...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Card View */}
                {viewMode === 'card' && (
                  <>
                    {packages && packages.length > 0 ? (
                      <div className="space-y-4">
                        {packages.map((pkg) => (
                          <MembershipPackageCard
                            key={pkg._id}
                            package={pkg}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-4">No membership packages found</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Create First Package
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <>
                    {packages && packages.length > 0 ? (
                      <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col max-h-full">
                        <div className="overflow-y-auto flex-1">
                          <MembershipPackageTable
                            packages={packages}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-4">No membership packages found</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Create First Package
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {tabMode === 'statistics' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Optional Filter/View Options could go here */}
          <div className="flex-1 overflow-y-auto">
            <MembershipStatsDashboard />
          </div>
        </div>
      )}

      {/* Create Tab */}
      {tabMode === 'create' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            <CreateMembershipPackageForm
              onSubmit={handleCreatePackage}
              onCancel={() => setTabMode('management')}
              isLoading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MpsManagement;
