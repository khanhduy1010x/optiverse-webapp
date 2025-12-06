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
                    className="bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer animate-fade-in flex flex-col h-full"
                    onClick={() => handleItemClick(item, purchaseRecord)}
                  >
                  {/* Image - Top */}
                  <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                      {item.title || t('unknown_item')}
                    </h3>

                    {/* Description */}
                    <div className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {item.description ? (
                        <div dangerouslySetInnerHTML={{ __html: item.description }} />
                      ) : (
                        <p className="text-gray-400">{t('no_description_text')}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-gray-100 mt-auto">
                      <p className="text-xl font-bold text-blue-600">
                        {purchaseRecord.price === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          <span>{purchaseRecord.price} <span className="text-xs font-normal text-gray-600">OP</span></span>
                        )}
                      </p>
                    </div>

                    {/* Purchase Date */}
                    <div className="text-xs text-gray-600 mb-3">
                      <p className="text-gray-500">{t('purchased_date')}: {new Date(purchaseRecord.purchased_at).toLocaleDateString('en-US')}</p>
                    </div>

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item, purchaseRecord);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      {t('view')}
                    </button>
                  </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {items.length > 0 && (
              <div className="mt-12 flex justify-center">
                <PaginationControl
                  currentPage={page}
                  totalPages={Math.ceil(total / 12) || 1}
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