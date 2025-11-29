import React, { useState, useEffect } from 'react';
import MarketplaceItemDetailModal from './MarketplaceItemDetailModal.component';
import PaginationControl from './PaginationControl.component';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import marketplaceService from '../../services/marketplace.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface CreatorProductsModalProps {
  isOpen: boolean;
  creatorId: string;
  creatorInfo?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  onClose: () => void;
}

const CreatorProductsModal: React.FC<CreatorProductsModalProps> = ({
  isOpen,
  creatorId,
  creatorInfo,
  onClose,
}) => {
  const { t } = useAppTranslate('marketplace');

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const itemsPerPage = 9;

  const priceRanges = [
    { label: t('all'), min: 0, max: 1000 },
    { label: t('free'), min: 0, max: 0 },
    { label: '0 - 100 OP', min: 0, max: 100 },
    { label: '100 - 350 OP', min: 100, max: 350 },
    { label: '350+ OP', min: 350, max: 1000 },
  ];

  const sortOptions = [
    { label: t('newest'), value: 'newest' },
    { label: t('oldest'), value: 'oldest' },
    { label: `${t('price')}: ${t('low_to_high')}`, value: 'price-asc' },
    { label: `${t('price')}: ${t('high_to_low')}`, value: 'price-desc' },
    { label: t('most_popular'), value: 'popular' },
  ];

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceRange, sortBy]);

  // Fetch products by creator
  useEffect(() => {
    if (!isOpen || !creatorId) return;

    const fetchCreatorProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await marketplaceService.getByCreatorId(
          creatorId,
          currentPage,
          itemsPerPage,
          searchQuery || undefined,
          priceRange.min === 0 && priceRange.max === 1000
            ? undefined
            : `${priceRange.min}-${priceRange.max}`,
          sortBy === 'newest' ? undefined : sortBy
        );

        setProducts(response.items || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
        console.log('Creator products response:', { 
          items: response.items?.length, 
          total: response.total, 
          totalPages: response.totalPages 
        });
      } catch (err) {
        console.error('Error fetching creator products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorProducts();
  }, [isOpen, creatorId, searchQuery, priceRange, sortBy, currentPage]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductClick = async (product: MarketplaceItem) => {
    try {
      const fullItem = await marketplaceService.getById(product._id);
      setSelectedItem(fullItem);
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {creatorInfo?.avatar_url ? (
                <img
                  src={creatorInfo.avatar_url}
                  alt={creatorInfo.full_name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {creatorInfo?.full_name?.[0]?.toUpperCase() || 'C'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {creatorInfo?.full_name || 'Creator'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {total} {t('products')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
              title={t('close')}
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-8 py-5 border-b border-gray-200/80 bg-gray-50/50">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('search_products')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition duration-200"
              >
                {t('search')}
              </button>
            </div>

            {/* Sort and Price Filter */}
            <div className="flex gap-3">
              {/* Price Filter */}
              <div className="flex-1 relative">
                <button
                  onClick={() => setExpandedDropdown(expandedDropdown === 'price' ? null : 'price')}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition"
                >
                  <span className="text-gray-700 font-medium">
                    {priceRange.min === 0 && priceRange.max === 0
                      ? t('free')
                      : priceRange.min === 0 && priceRange.max === 1000
                      ? t('all')
                      : `${priceRange.min} - ${priceRange.max} OP`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedDropdown === 'price' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
                {expandedDropdown === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
                    {priceRanges.map((range, index) => (
                      <button
                        key={`${range.min}-${range.max}`}
                        onClick={() => {
                          setPriceRange(range);
                          setExpandedDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${
                          index > 0 ? 'border-t border-gray-100' : ''
                        } ${
                          priceRange.min === range.min && priceRange.max === range.max
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="flex-1 relative">
                <button
                  onClick={() => setExpandedDropdown(expandedDropdown === 'sort' ? null : 'sort')}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition"
                >
                  <span className="text-gray-700 font-medium">
                    {sortOptions.find(opt => opt.value === sortBy)?.label || t('newest')}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedDropdown === 'sort' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
                {expandedDropdown === 'sort' && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
                    {sortOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setExpandedDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${
                          index > 0 ? 'border-t border-gray-100' : ''
                        } ${
                          sortBy === option.value
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">{t('loading')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 mb-4 text-sm font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition"
                >
                  {t('retry')}
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">{t('no_products_found')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-6">
                  {products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className="group cursor-pointer text-left"
                    >
                      {/* Card Container */}
                      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-200 border border-gray-100">
                        {/* Product Image */}
                        <div className="relative bg-gray-100 rounded-t-2xl overflow-hidden h-44">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          {/* Product Title */}
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                            {product.title}
                          </h3>

                          {/* Creator Info */}
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            {product.creator_info?.avatar_url ? (
                              <img
                                src={product.creator_info.avatar_url}
                                alt={product.creator_info.full_name}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {product.creator_info?.full_name?.[0]?.toUpperCase() || 'C'}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-gray-600 font-medium truncate flex-1">
                              {product.creator_info?.full_name || 'Unknown'}
                            </p>
                          </div>

                          {/* Rating & Purchase Count */}
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-green-600 text-xs font-semibold">✓</span>
                              <span className="text-xs text-gray-700 font-medium">{product.purchase_count || 0} Purchase</span>
                            </div>
                            <div className={`text-sm font-bold ${product.price > 0 ? 'text-gray-900' : 'text-green-600'}`}>
                              {product.price > 0 ? `${product.price} OP` : t('free')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages >= 1 && (
                  <div className="mt-8 flex justify-center border-t border-gray-200/80 pt-8">
                    <PaginationControl
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <MarketplaceItemDetailModal
          isOpen={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFavoriteChange={() => {}}
        />
      )}
    </>
  );
};

export default CreatorProductsModal;
