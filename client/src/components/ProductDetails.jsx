import React, { useState } from 'react';
import Badge from './common/Badge';
import ImageGallery from './common/ImageGallery';
import CountdownTimer from './common/CountdownTimer';
import BidControls from './common/BidControls';
import TabNavigation from './common/TabNavigation';
import AuctionSection from './sections/AuctionSection';

const ProductDetails = ({ 
  product = {
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
      'https://via.placeholder.com/600x400/01AA85/ffffff?text=Main+Image',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+1',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+2',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+3',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+4',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+5',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+6',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+7',
      'https://via.placeholder.com/100x100/01AA85/ffffff?text=Thumb+8',
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
  },
  className = ''
}) => {
  const [bidAmount, setBidAmount] = useState(product.reservePrice);
  const [activeTab, setActiveTab] = useState('description');

  // Sample related products data
  const relatedProducts = [
    {
      id: 101,
      lotNumber: '576894',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      title: 'Premium Headphones Collection',
      currentBid: 2458,
      status: 'live',
      timeLeft: { days: 52, hours: 13, minutes: 32, seconds: 48 },
    },
    {
      id: 102,
      lotNumber: '679542',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      title: 'Luxury Watch Limited Edition',
      currentBid: 5200,
      status: 'live',
      timeLeft: { days: 45, hours: 8, minutes: 15, seconds: 30 },
    },
    {
      id: 103,
      lotNumber: '467188',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
      title: 'Designer Sneakers Rare',
      currentBid: 1850,
      status: 'live',
      timeLeft: { days: 38, hours: 22, minutes: 45, seconds: 12 },
    },
    {
      id: 104,
      lotNumber: '258967',
      image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
      title: 'Vintage Camera Collection',
      currentBid: 3100,
      status: 'live',
      timeLeft: { days: 29, hours: 14, minutes: 28, seconds: 55 },
    },
    {
      id: 105,
      lotNumber: '238964',
      image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop',
      title: 'Modern Art Sculpture',
      currentBid: 4750,
      status: 'live',
      timeLeft: { days: 60, hours: 5, minutes: 38, seconds: 20 },
    },
  ];

  const handleBidChange = (newAmount) => {
    setBidAmount(newAmount);
  };

  const handlePlaceBid = () => {
    // Logic đặt giá
    console.log('Placing bid:', bidAmount);
    // Có thể thêm API call ở đây
    alert(`Bid placed: $${bidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column - Images */}
        <ImageGallery 
          images={product.images}
          alt={product.title}
        />

        {/* Right Column - Product Info */}
        <div className="space-y-3">
          {/* Lot Number Badge */}
          {/* <div>
            <Badge variant="lightPrimary" size="sm" className="font-semibold">
              Lot # 368954
            </Badge>
          </div> */}

          {/* Title */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1.5">
              Invest Smartly in Today's Dynamic Real Estate Market
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Current Bid */}
          <div>
            <p className="text-[10px] text-gray-600 font-medium mb-0.5">Current bid:</p>
            <p className="text-xl font-bold text-gray-900">
              ${product.currentBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Condition Badge */}
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold text-gray-900 uppercase">Item Condition:</p>
            <Badge variant="lightPrimary" size="xs" className="font-semibold">
              {product.condition}
            </Badge>
          </div>

          {/* Countdown Timer */}
          <div>
            <p className="text-[10px] font-medium text-gray-700 mb-1.5">Time left:</p>
            <CountdownTimer 
              endDate={product.auctionEndDate}
              timezone={product.timezone}
              variant="compact"
            />
          </div>

          {/* Reserve Price Notice */}
          {product.reservePriceMet && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-green-800 font-medium">
                ✓ Reserve price has been met
              </p>
            </div>
          )}

          {/* Bid Controls */}
          <BidControls 
            currentBid={product.currentBid}
            bidAmount={bidAmount}
            onBidChange={handleBidChange}
            onBid={handlePlaceBid}
            minBidIncrement={500}
          />

          {/* Additional Info */}
          <div className="space-y-1.5 text-[10px]">
            {/* <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">SKU:</span>
              <span className="text-gray-600">{product.sku}</span>
            </div> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Categories:</span>
                <span className="text-gray-600">{product.categories.join(', ')}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:text-primary border border-gray-300 hover:border-primary rounded-lg transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask a question
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-600 rounded-lg transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to watch list
                </button>
              </div>
            </div>
            {/* <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Tags:</span>
              <span className="text-gray-600">{product.tags.join(', ')}</span>
            </div> */}
          </div>

          {/* Safe Checkout */}
          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
            <p className="text-[10px] text-gray-700 font-medium text-center">
              🔒 Guaranted Safe Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <TabNavigation 
          tabs={[
            { key: 'description', label: 'Description' },
            { key: 'auction-history', label: 'Auction History' },
            { key: 'reviews', label: 'Reviews (0)' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                They're kinda our Best thing!
              </h2>
              
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                {product.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Features Grid */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-primary font-bold text-sm">{feature.icon}</span>
                    <span className="text-sm text-gray-700">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'auction-history' && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 border-r border-gray-300">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 border-r border-gray-300">Bid</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 border-r border-gray-300">User</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Auto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">June 20, 2025 3:55 am</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$6,051.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">yizhan_96</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">April 24, 2025 12:51 pm</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$6,001.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">ashrafashash2010</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">March 9, 2025 3:08 pm</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$5,951.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">jelie2002</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">February 25, 2025 9:16 am</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$5,901.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">andriatiana.janeck</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">January 4, 2025 12:40 pm</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$5,836.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">demo</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">January 2, 2025 7:54 am</td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">$5,786.00</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">mikmak</td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">November 8, 2024 12:00 am</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300">Auction started</td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-r border-gray-300"></td>
                      <td className="py-4 px-6 text-sm text-gray-600"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Reviews List */}
              <div className="lg:col-span-1">
                <h3 className="text-base font-bold text-gray-900 mb-3">Reviews</h3>
                <p className="text-sm text-gray-500">There are no reviews yet.</p>
              </div>

              {/* Right Column - Review Form */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Be the first to review <span className="text-gray-700">"{product.title}"</span>
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
                </p>

                <form className="space-y-3">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Save Info Checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="save-info"
                      className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="save-info" className="text-xs text-gray-600 leading-snug">
                      Save my name, email, and website in this browser for the next time I comment.
                    </label>
                  </div>

                  {/* Rating Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Your rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-xl text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          ☆
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Your review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-md transition-colors duration-200 text-sm"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section - Thu gọn */}
      <div className="mt-6">
        <AuctionSection
          title="Related"
          subtitle="Products"
          items={relatedProducts}
          itemsPerView={5}
          showFilter={false}
          className=""
        />
      </div>
    </div>
  );
};

export default ProductDetails;
