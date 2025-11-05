// Marketplace Item Detail Modal Styles
export const scrollbarHideStyle = `
    .marketplace-modal::-webkit-scrollbar {
        display: none;
    }
    
    .marketplace-modal {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
    }
    
    .animate-slide-up {
        animation: slideUp 0.4s ease-out;
    }
    
    .badge-primary {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
    }
    
    .badge-secondary {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
    }
    
    .btn-secondary {
        border: 2px solid #d1d5db;
        background: white;
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        border-color: #0ea5e9;
        background: #f0f9fe;
        color: #0284c7;
    }
    
    .image-container {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
    }
    
    .image-container img {
        transition: transform 0.3s ease;
    }
    
    .image-container:hover img {
        transform: scale(1.05);
    }
`;
