import React, { useState } from 'react';
import { useMyItems } from '../../hooks/marketplace/useMyItems';
import { useDeleteMarketplaceItem } from '../../hooks/marketplace/useDeleteMarketplaceItem';
import CreateMarketplaceModal from '../../components/Marketplace/CreateMarketplaceModal.component';
import UpdateMarketplaceModal from '../../components/Marketplace/UpdateMarketplaceModal.component';
import ConfirmDialog from '../../components/Marketplace/ConfirmDialog.component';
import { RatingList } from '../../components/Marketplace/RatingList.component';
import Modal from 'react-modal';
import { MarketplaceItem } from '../../types/marketplace/marketplace.types';

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
  const { items, loading, error, page, setPage, refetch } = useMyItems();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
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
                <p className="text-gray-500">Loading data...</p>
            </div>
        );
    }

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="myitems-page min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
                        <p className="text-gray-600 mt-1">
                            Manage the marketplace items you've created
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Create New Item
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {deleteError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{deleteError}</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 mb-4">You haven't created any marketplace items yet</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Create New Item
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {items.map(item => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        <img
                                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {item.price === 0 && (
                                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                Free
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="text-gray-600 text-xs mb-4 line-clamp-2 prose prose-sm max-w-none">
                                            {item.description ? (
                                                <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                            ) : (
                                                <p>No description</p>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="mb-5 pb-5 border-b border-gray-100">
                                            {item.price > 0 ? (
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {item.price} <span className="text-sm font-normal text-gray-600">OP</span>
                                                </p>
                                            ) : (
                                                <p className="text-xl font-bold text-gray-900">
                                                    Free
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowUpdateModal(true);
                                                }}
                                                className="px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowRatingsModal(true);
                                                }}
                                                className="px-3 py-2.5 border border-yellow-400 text-yellow-600 rounded-lg font-medium text-sm hover:bg-yellow-50 transition-colors"
                                            >
                                                ★
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                disabled={isDeleting}
                                                className="px-3 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">{page}</span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={items.length < 10}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
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
                title="Delete Item"
                message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
                confirmButtonText="Delete"
                cancelButtonText="Cancel"
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
                            <h2 className="text-2xl font-bold text-gray-900">Item Ratings</h2>
                           
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
                        Close
                    </button>
                </div>
            </Modal>
        </div>
        </>
    );
};

export default MyItemsPage;
