import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import marketplaceFollowerService from '../../services/marketplace-follower.service';
import CreatorProductsModal from '../../components/Marketplace/CreatorProductsModal.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';

interface Follower {
  _id: string;
  creator_id: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  createdAt: string;
}

// Hide scrollbar style
const scrollbarHideStyle = `
    .followers-page::-webkit-scrollbar {
        display: none;
    }
    .followers-page {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

const FollowersPage: React.FC = () => {
  const { t } = useAppTranslate('follow');
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Follower['creator_id'] | null>(null);
  const limit = 15;

  const userId = localStorage.getItem('user_id') || '';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchFollowers();
  }, [page, userId, debouncedSearch]);

  const fetchFollowers = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await marketplaceFollowerService.getFollowingList(
        page,
        limit,
        debouncedSearch
      );
      console.log('Followers response:', response);
      console.log('Following data:', response.following);
      setFollowers(response.following || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching following list:', err);
      setError('Failed to load following list');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewProfile = (creator: Follower['creator_id']) => {
    console.log('handleViewProfile called with creator:', creator);
    setSelectedCreator(creator);
    setShowCreatorModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">{t('loading_followers')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <div className="followers-page min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header - Apple Style */}
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-none mb-4">
              {t('creators_i_follow')}
            </h1>
            <p className="text-gray-600 text-base font-light">
              {t('all_creators_you_follow')} — <span className="font-semibold text-gray-900">{total} {t('creators')}</span>
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pb-6">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={t('find_creator')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pb-20">
          {error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg mb-6">{error}</p>
              <button
                onClick={fetchFollowers}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all hover:shadow-lg"
              >
                {t('retry')}
              </button>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 5H9m4 5H9" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-light">{t('no_creators_yet')}</p>
            </div>
          ) : (
            <>
              {/* Creators Grid - Apple Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mb-16">
                {followers.map((item) => (
                  <div
                    key={`${item._id}-${item.creator_id._id}`}
                    className="group flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Avatar - Large with subtle shadow */}
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <img
                        src={
                          item.creator_id.avatar_url ||
                          `https://ui-avatars.com/api/?name=${item.creator_id.full_name}&background=0ea5e9&color=fff&size=160`
                        }
                        alt={item.creator_id.full_name}
                        className="relative w-32 h-32 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                      />
                    </div>

                    {/* Creator Name */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.creator_id.full_name}
                    </h3>

                    {/* Action Button - Minimal */}
                    <button 
                      onClick={() => handleViewProfile(item.creator_id)}
                      className="mt-6 px-8 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 group-hover:bg-blue-100">
                      {t('view_profile')}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination - Apple Style */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16 pt-8 border-t border-gray-200">
                  <PaginationControl
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Creator Products Modal */}
      <CreatorProductsModal
        isOpen={showCreatorModal}
        creatorId={selectedCreator?.user_id || ''}
        creatorInfo={selectedCreator || undefined}
        onClose={() => {
          setShowCreatorModal(false);
          setSelectedCreator(null);
        }}
      />
    </>
  );
};

export default FollowersPage;
