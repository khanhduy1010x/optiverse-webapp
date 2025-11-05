import React, { useState } from 'react';
import { usePurchaseHistory } from '../../hooks/marketplace/usePurchaseHistory';
import PurchaseHistoryDetailModal from '../../components/Marketplace/PurchaseHistoryDetailModal.component';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { formatPrice } from '../../utils/marketplace.transform';

const PurchaseHistoryPage: React.FC = () => {
  const { items, loading, error, page, total, setPage, refetch } = usePurchaseHistory();
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(total / 10);

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
            <p className="mt-4 text-gray-600">Loading purchase history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
        <p className="text-gray-600 mt-1">
          All items you have purchased from the marketplace
        </p>
      </div>

      <div className="p-6">

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center max-w-4xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Purchase History</h2>
            <p className="text-gray-600 mb-6">You haven't purchased any items from the marketplace yet</p>
            <a
              href="/marketplace"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Explore Marketplace
            </a>
          </div>
        ) : (
          <>
            {/* Items Grid - Vertical Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl">
              {items.filter(item => item.item).map((purchaseRecord) => {
                const item = purchaseRecord.item;
                if (!item) return null;
                
                return (
                <div
                  key={purchaseRecord._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group flex flex-col h-full"
                  onClick={() => handleItemClick(item, purchaseRecord)}
                >
                  {/* Image - Top */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-50">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                  </div>

                  {/* Content - Bottom */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.title || 'Unknown Item'}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {item.description || 'No description'}
                    </p>

                    {/* Creator Info */}
                    {item.creator_info && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                        <img
                          src={
                            item.creator_info.avatar_url ||
                            `https://ui-avatars.com/api/?name=${item.creator_info.full_name}&background=0ea5e9&color=fff&size=24`
                          }
                          alt={item.creator_info.full_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <p className="text-xs font-semibold text-gray-800 truncate flex-1">
                          {item.creator_info.full_name}
                        </p>
                      </div>
                    )}

                    {/* Date and Price */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Purchased:</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {new Date(purchaseRecord.purchased_at).toLocaleDateString('en-US')}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="text-lg font-bold text-blue-600">{purchaseRecord.price === 0 ? 'Free' : `${purchaseRecord.price} OP`}</p>
                    </div>

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item, purchaseRecord);
                      }}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors mt-auto"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                      page === p
                        ? 'bg-sky-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next →
                </button>
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
  );
};

export default PurchaseHistoryPage;
