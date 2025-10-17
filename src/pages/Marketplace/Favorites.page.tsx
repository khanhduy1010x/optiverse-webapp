import React from 'react';

const MarketplaceFavoritesPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Mục yêu thích</h1>
            <p className="text-gray-600 mt-2">UI mẫu danh sách yêu thích Marketplace.</p>
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6">
                <p className="text-gray-500">Danh sách item yêu thích (placeholder).</p>
            </div>
        </div>
    );
};

export default MarketplaceFavoritesPage;
