import React from 'react';
import ProductDetails from '../components/ProductDetails';

const ProductDetailsPage = () => {
  // Sample product data - trong thực tế sẽ lấy từ API hoặc props
  const productData = {
    id: 'ARC-458-1',
    title: 'Building Wealth Through Real Estate: A Guide',
    description: 'Aptent taciti sociosa litor torquen per conubia nostra, per incep placerat felis non aliquam.Mauris nec justo vitae ante auctor.',
    currentBid: 22007.00,
    reservePrice: 22507.00,
    reservePriceMet: true,
    condition: 'USED',
    auctionEndDate: '2026-01-30T12:00:00',
    timezone: 'UTC 0',
    sku: 'ARC-458-1',
    categories: ['Ceramics', 'Real Estate'],
    tags: ['Building', 'Real Estate'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop',
    ],
    features: [
      { icon: '✓', label: 'Paraben-Free' },
      { icon: '✓', label: 'Sulfate-Free' },
      { icon: '✓', label: 'Clean at Sephora' },
      { icon: '✓', label: 'Clean at Sephora' },
      { icon: '✓', label: 'Fragrance Free' },
      { icon: '✓', label: 'Cruelty-Free' },
      { icon: '✓', label: 'Antioxidants' },
      { icon: '✓', label: 'Antioxidants' },
    ],
    fullDescription: `Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec, consequat dapibus metus. Vav urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Dphare lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit.

Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec.

Nunc posuere at augue eget porta. Inei odion goat tellus, dignissim fermentumara purus nec, consequat dapibus metus.Vivamus urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Duis pharetra lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit, ateng maximus est eleifend accui Fusce porttitor ex ercu, Phasellus viverra lorem an nibh placerat tincidunt.bologtai Aliquam andit rutrum elementum urna, velgeria fringilla tellus varius ut. Morbi non velit odio.`
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Invest Smartly In Today's Dynamic Real Estate Market
          </h1>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex justify-center items-center text-sm">
            <a href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Home
            </a>
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/products" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Products
            </a>
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">
              Invest Smartly In Today's Dynamic Real Estate Market
            </span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <ProductDetails product={productData} />
    </div>
  );
};

export default ProductDetailsPage;
