import React, { useState, useMemo } from 'react';
import MarketplaceGrid from '../../components/Marketplace/MarketplaceGrid.component';
import MarketplaceFilterBar from '../../components/Marketplace/MarketplaceFilterBar.component';
import { MarketplaceProduct } from '../../components/Marketplace/MarketplaceCard.component';

const MarketplaceHomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [popularity, setPopularity] = useState('all');
    const [category, setCategory] = useState('all');

    const sampleProducts: MarketplaceProduct[] = [
        {
            id: '1',
            name: 'Beautiful Landing Page Template',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            price: 15,
            discount: 20,
            seller: 'John Designer',
            purchaseCount: 1240,
            rating: 4.8,
            ratingCount: 342,
        },
        {
            id: '2',
            name: 'E-commerce Dashboard Plugin',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
            price: 0,
            seller: 'Sarah Dev',
            purchaseCount: 856,
            rating: 4.6,
            ratingCount: 213,
        },
        {
            id: '3',
            name: 'Premium Icon Pack (5000+)',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            price: 25,
            discount: 15,
            seller: 'Design Studio Pro',
            purchaseCount: 2103,
            rating: 4.9,
            ratingCount: 567,
        },
        {
            id: '4',
            name: 'React Component Library',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
            price: 30,
            seller: 'Tech Masters',
            purchaseCount: 512,
            rating: 4.7,
            ratingCount: 128,
        },
        {
            id: '5',
            name: 'Figma Design System',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            price: 20,
            discount: 10,
            seller: 'Design Pro Co',
            purchaseCount: 789,
            rating: 4.5,
            ratingCount: 195,
        },
        {
            id: '6',
            name: 'AI Writing Assistant Plugin',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            price: 0,
            seller: 'AI Creators',
            purchaseCount: 1523,
            rating: 4.8,
            ratingCount: 421,
        },
    ];

    // Apply filters and sorting
    const filteredProducts = useMemo(() => {
        let products = sampleProducts;

        // Search filter
        if (searchQuery) {
            products = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Price filter
        products = products.filter(product =>
            product.price >= priceRange.min && product.price <= priceRange.max
        );

        // Popularity filter
        if (popularity !== 'all') {
            products = products.filter(product => {
                switch (popularity) {
                    case 'top-100':
                        return product.purchaseCount >= 500;
                    case 'top-1000':
                        return product.purchaseCount >= 1000;
                    case 'top-500':
                        return product.purchaseCount >= 500;
                    default:
                        return true;
                }
            });
        }

        // Sort
        const sorted = [...products];
        switch (sortBy) {
            case 'newest':
                break;
            case 'oldest':
                sorted.reverse();
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'popular':
                sorted.sort((a, b) => b.purchaseCount - a.purchaseCount);
                break;
            default:
                break;
        }

        return sorted;
    }, [searchQuery, priceRange, popularity, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 p-6">
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600 mt-1">
                    Khám phá template, plugin, và gói mở rộng từ cộng đồng
                </p>
            </div>

            {/* Enhanced Filter Bar */}
            <MarketplaceFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                popularity={popularity}
                onPopularityChange={setPopularity}
                category={category}
                onCategoryChange={setCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Products Grid Section */}
            <div className="p-6">
                <MarketplaceGrid
                    products={filteredProducts}
                    onProductClick={(product) => {
                        console.log('Clicked product:', product);
                    }}
                />
            </div>
        </div>
    );
};

export default MarketplaceHomePage;
