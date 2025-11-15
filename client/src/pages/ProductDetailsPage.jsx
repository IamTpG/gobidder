import React from "react";
import ProductDetails from "../components/ProductDetails";

const ProductDetailsPage = () => {
  // Mock data - sẽ được thay thế bằng API call sau khi Backend hoàn thành
  const productData = {
    id: 1,
    name: "Invest Smartly in Today's Dynamic Real Estate Market",
    description:
      "Aptent taciti sociosa litor torquen per conubia nostra, per incep placerat felis non aliquam. Mauris nec justo vitae ante auctor.",
    currentBid: 22007.0,
    buyNowPrice: 22507.0,
    startPrice: 10000.0,
    stepPrice: 500.0,
    auctionEndDate: "2026-01-30T12:00:00",
    createdAt: "2024-11-01T10:00:00",
    timezone: "UTC 0",
    category: "Real Estate",
    bidCount: 15,

    // Thông tin người bán
    seller: {
      name: "John Smith",
      ratingPlus: 45,
      ratingMinus: 5,
    },

    // Thông tin người đặt giá cao nhất hiện tại
    currentBidder: {
      name: "Jane Doe",
      ratingPlus: 30,
      ratingMinus: 2,
    },

    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop",
    ],

    fullDescription: `Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec, consequat dapibus metus. Vav urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Dphare lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit.

Urna Aenean onewaryzo eleifend vitae tellus a facilisis. Nunc posuere at augue eget port. Inei odion goet tellus, dignissim fermentumara purus nec.

Nunc posuere at augue eget porta. Inei odion goat tellus, dignissim fermentumara purus nec, consequat dapibus metus.Vivamus urna worlda mauris, goat te faucibus at egestas quis, fermentum egetonav neque. Duis pharetra lectus nec risuonl pellentesque, opi vitae aliquet nisi dapibus. Sed volutpat mi velit, ateng maximus est eleifend accui Fusce porttitor ex ercu, Phasellus viverra lorem an nibh placerat tincidunt.bologtai Aliquam andit rutrum elementum urna, velgeria fringilla tellus varius ut. Morbi non velit odio.`,

    // Lịch sử đặt giá
    bidHistory: [
      { id: 1, date: "2024-11-14T09:00:00", amount: 22007.0, user: "Jane Doe" },
      {
        id: 2,
        date: "2024-11-13T15:30:00",
        amount: 21507.0,
        user: "Mike Davis",
      },
      { id: 3, date: "2024-11-12T14:20:00", amount: 21007.0, user: "Jane Doe" },
      {
        id: 4,
        date: "2024-11-11T10:15:00",
        amount: 20507.0,
        user: "Sarah Wilson",
      },
      {
        id: 5,
        date: "2024-11-10T16:45:00",
        amount: 20007.0,
        user: "Tom Brown",
      },
    ],

    // Q&A
    qnaItems: [
      {
        id: 1,
        questionText: "Is the property still available for viewing?",
        questionTime: "2024-11-10T10:00:00",
        questionerId: 2,
        questioner: {
          id: 2,
          fullName: "Bob Johnson",
          ratingPlus: 20,
          ratingMinus: 1,
        },
        answerText: "Yes, viewings are available on weekdays from 2-5 PM.",
        answerTime: "2024-11-10T14:00:00",
      },
      {
        id: 2,
        questionText: "What is the property tax rate?",
        questionTime: "2024-11-12T09:30:00",
        questionerId: 3,
        questioner: {
          id: 3,
          fullName: "Alice Williams",
          ratingPlus: 35,
          ratingMinus: 3,
        },
        answerText: "The annual property tax is approximately $2,500.",
        answerTime: "2024-11-12T15:00:00",
      },
      {
        id: 3,
        questionText: "Are pets allowed in this property?",
        questionTime: "2024-11-13T11:00:00",
        questionerId: 4,
        questioner: {
          id: 4,
          fullName: "Charlie Brown",
          ratingPlus: 10,
          ratingMinus: 0,
        },
        answerText: null,
        answerTime: null,
      },
    ],
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            {productData.name}
          </h1>

          {/* Breadcrumb Navigation */}
          <nav className="flex justify-center items-center text-sm">
            <a
              href="/"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Home
            </a>
            <svg
              className="w-4 h-4 mx-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <a
              href="/products"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Products
            </a>
            <svg
              className="w-4 h-4 mx-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {productData.category && (
              <>
                <span className="text-primary hover:text-primary/80 font-medium transition-colors">
                  {productData.category}
                </span>
                <svg
                  className="w-4 h-4 mx-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
            <span className="text-gray-600 truncate max-w-md">
              {productData.name}
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
