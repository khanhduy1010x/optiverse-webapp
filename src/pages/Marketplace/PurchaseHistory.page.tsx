import React, { useState } from 'react';
import { usePurchaseHistory } from '../../hooks/marketplace/usePurchaseHistory';
import PurchaseHistoryDetailModal from '../../components/Marketplace/PurchaseHistoryDetailModal.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
import RichTextDisplay from '../../components/common/RichTextDisplay.component';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { formatPrice } from '../../utils/marketplace.transform';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import '../../components/common/RichTextDisplay.style.css';

const PurchaseHistoryPage: React.FC = () => {
  const { t } = useAppTranslate('marketplace');
  const { items, loading, error, page, total, setPage, refetch } = usePurchaseHistory();
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(total / 12);

  const handleItemClick = (item: MarketplaceItem, purchaseRecord: any) => {
    console.log('Selected item:', item);
    console.log('Selected purchase:', purchaseRecord);
    setSelectedItem(item);
    setSelectedPurchase(purchaseRecord);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setSelectedPurchase(null);
  };

  React.useEffect(() => {
    console.log('Items loaded:', items);
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-[2000px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{t('purchase_history')}</h1>
          <p className="text-gray-500 mt-3 text-lg">
            {t('all_items_purchased')}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-[2000px] mx-auto">

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('no_purchase_history')}</h2>
            <p className="text-gray-600 mb-6">{t('no_purchase_history_msg')}</p>
            <a
              href="/marketplace"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              {t('explore_marketplace')}
            </a>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
              {items.filter(item => item.item).map((purchaseRecord, index) => {
                const item = purchaseRecord.item;
                if (!item) return null;

                return (
                  <div
                    key={purchaseRecord._id}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer border border-gray-200/50 hover:border-gray-300/80 flex flex-col h-full"
                    onClick={() => handleItemClick(item, purchaseRecord)}
                  >
                  {/* Image - Top */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                        <span className="text-5xl">📄</span>
                      </div>
                    )}
                  </div>

                  {/* Content - Bottom */}
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title || 'Unknown Item'}
                      </h3>
                    </div>

                    {/* Creator Info */}
                    {item.creator_info && (
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <img
                          src={
                            item.creator_info.avatar_url ||
                            `https://ui-avatars.com/api/?name=${item.creator_info.full_name}&background=random&size=40`
                          }
                          alt={item.creator_info.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.creator_info.full_name}
                          </p>
                          <p className="text-xs text-gray-500">Creator</p>
                        </div>
                      </div>
                    )}          
                    {/* Date and Price */}
                    <div className="space-y-3 pb-4 border-b border-gray-100 text-xs">
                      <div>
                        <p className="text-gray-500 mb-1">{t('purchased_date')}:</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(purchaseRecord.purchased_at).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="pt-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {purchaseRecord.price === 0 ? (
                          <span className="text-green-600">{t('free')}</span>
                        ) : (
                          <span>{purchaseRecord.price} <span className="text-base font-semibold text-gray-500">OP</span></span>
                        )}
                      </p>
                    </div>

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item, purchaseRecord);
                      }}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mt-auto"
                    >
                      {t('view')}
                    </button>
                  </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16">
                <PaginationControl
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}

        {/* Purchase History Detail Modal */}
        <PurchaseHistoryDetailModal
          item={selectedItem}
          purchaseDate={selectedPurchase?.purchased_at}
          purchasePrice={selectedPurchase?.price}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PurchaseHistoryPage;