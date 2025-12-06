import React, { useState } from 'react';
import { useMyItems } from '../../hooks/marketplace/useMyItems';
import { useDeleteMarketplaceItem } from '../../hooks/marketplace/useDeleteMarketplaceItem';
import CreateMarketplaceModal from '../../components/Marketplace/CreateMarketplaceModal.component';
import UpdateMarketplaceModal from '../../components/Marketplace/UpdateMarketplaceModal.component';
import MarketplaceItemDetailModal from '../../components/Marketplace/MarketplaceItemDetailModal.component';
import ConfirmDialog from '../../components/Marketplace/ConfirmDialog.component';
import { RatingList } from '../../components/Marketplace/RatingList.component';
import PaginationControl from '../../components/Marketplace/PaginationControl.component';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

// Hide scrollbar style
const scrollbarHideStyle = `
    .myitems-page::-webkit-scrollbar {
        display: none;
    }
    .myitems-page {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

const MyItemsPage: React.FC = () => {
  const { t } = useAppTranslate('marketplace');
  const { items, loading, error, page, total, setPage, refetch } = useMyItems();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  
  const {
    isDeleting,
    deleteError,
    showDeleteConfirm,
    itemToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    setDeleteError,
  } = useDeleteMarketplaceItem(refetch);

  
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">{t('loading')}</p>
            </div>
        );
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="myitems-page min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900">{t('my_items')}</h1>
                        <p className="text-gray-500 mt-2 text-base">
                            {t('manage_marketplace_items')}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-base"
                    >
                        {t('create_new_item')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
                <div>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-gray-500">{t('loading')}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
                            <p className="text-gray-500 mb-4 text-lg">{t('no_items_yet')}</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {t('create_new_item')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                                {items.map((item, idx) => (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowDetailModal(true);
                                        }}
                                        className="bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in cursor-pointer"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Image */}
                                        <div className="relative h-56 bg-gray-100 overflow-hidden">
                                            <img
                                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'}
                                                alt={item.title}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                            />
                                            {item.price === 0 && (
                                                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    {t('free')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <div className="text-gray-600 text-xs mb-3 line-clamp-2 prose prose-sm max-w-none">
                                                {item.description ? (
                                                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                                ) : (
                                                    <p className="text-gray-400">{t('no_description_text')}</p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="mb-4 pb-4 border-b border-gray-100">
                                                {item.price > 0 ? (
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {item.price} <span className="text-xs font-normal text-gray-600">OP</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {t('free')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setShowUpdateModal(true);
                                                    }}
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium text-xs hover:bg-gray-50 transition-colors"
                                                >
                                                    {t('edit')}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setShowRatingsModal(true);
                                                    }}
                                                    className="px-3 py-2 border border-yellow-300 text-yellow-600 rounded-lg font-medium text-xs hover:bg-yellow-50 transition-colors"
                                                >
                                                    ★
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(item);
                                                    }}
                                                    disabled={isDeleting}
                                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg font-medium text-xs hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {t('delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center">
                                <PaginationControl
                                    currentPage={page}
                                    totalPages={Math.ceil(total / 12)}
                                    onPageChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <CreateMarketplaceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    refetch();
                }}
            />

            {/* Update Modal */}
            <UpdateMarketplaceModal
                isOpen={showUpdateModal}
                item={selectedItem}
                onClose={() => {
                    setShowUpdateModal(false);
                    setSelectedItem(null);
                }}
                onSuccess={() => {
                    setShowUpdateModal(false);
                    setSelectedItem(null);
                    refetch();
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title={t('delete_item')}
                message={`${t('are_you_sure_delete', { item_name: itemToDelete?.title })}`}
                confirmButtonText={t('delete')}
                cancelButtonText={t('cancel')}
                isLoading={isDeleting}
                isDangerous={true}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            {/* Ratings Modal */}
            <Modal
                isOpen={showRatingsModal && !!selectedItem}
                onRequestClose={() => {
                    setShowRatingsModal(false);
                    setSelectedItem(null);
                }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
                overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
            >
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('item_ratings')}</h2>
                           
                        </div>
                        <button
                            onClick={() => {
                                setShowRatingsModal(false);
                                setSelectedItem(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Rating List */}
                    {selectedItem && (
                        <RatingList
                            marketplaceId={selectedItem._id}
                            onRatingDeleted={() => {
                                // Refresh if needed
                            }}
                        />
                    )}

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            setShowRatingsModal(false);
                            setSelectedItem(null);
                        }}
                        className="w-full mt-6 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition"
                    >
                        {t('close')}
                    </button>
                </div>
            </Modal>

            {/* Detail Modal */}
            {selectedItem && (
                <MarketplaceItemDetailModal
                    isOpen={showDetailModal}
                    item={selectedItem}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedItem(null);
                    }}
                    onFavoriteChange={refetch}
                />
            )}
        </div>
        </>
    );
};

export default MyItemsPage;