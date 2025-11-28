import React from 'react';
import Countdown from './Countdown';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  image,
  badge,
  className = '',
  variant = 'default',
  hoverable = false,
  bordered = true,
  shadow = 'sm',
  padding = 'default',
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = `
    bg-white rounded-2xl overflow-hidden
    transition-all duration-300
    ${hoverable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  // Variant styles - dựa trên theme primary #01AA85
  const variants = {
    // Default - Card trắng cơ bản
    default: `
      ${bordered ? 'border border-slate-200' : ''}
    `,

    // Primary - Card với accent primary
    primary: `
      border-l-4 border-l-primary
      ${bordered ? 'border border-slate-200' : ''}
    `,

    // Gradient - Card với gradient background (như trong giao diện)
    gradient: `
      bg-gradient-to-br from-primary/5 to-primary/10
      ${bordered ? 'border-2 border-primary/20' : ''}
    `,

    // Success - Card màu xanh lá nhạt
    success: `
      border-l-4 border-l-green-500
      ${bordered ? 'border border-slate-200' : ''}
    `,

    // Warning
    warning: `
      border-l-4 border-l-yellow-500
      ${bordered ? 'border border-slate-200' : ''}
    `,

    // Danger
    danger: `
      border-l-4 border-l-red-500
      ${bordered ? 'border border-slate-200' : ''}
    `,

    // Outlined - Card chỉ có viền
    outlined: `
      border-2 border-slate-200
      hover:border-primary
    `,

    // Elevated - Card nổi (dùng cho auction card)
    elevated: `
      shadow-lg
      ${bordered ? 'border border-slate-100' : ''}
    `,
  };

  // Shadow styles
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${shadows[shadow]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Badge (Live, Upcoming, etc.) */}
      {badge && (
        <div className="absolute top-4 left-4 z-10">
          {badge}
        </div>
      )}

      {/* Image */}
      {image && (
        <div className="relative w-full h-48 overflow-hidden">
          {typeof image === 'string' ? (
            <img
              src={image}
              alt={title || 'Card image'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            image
          )}
        </div>
      )}

      {/* Content */}
      <div className={paddings[padding]}>
        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="text-slate-700">
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// AuctionCard - Card chuyên dụng cho sản phẩm đấu giá (Design giống PROBID)
export const AuctionCard = ({
  id,
  images, // Json array từ DB: ["url1", "url2", ...]
  name, // Tên sản phẩm từ DB
  current_price, // BigInt -> String từ DB
  start_price, // BigInt -> String từ DB
  buy_now_price, // BigInt -> String từ DB (optional)
  current_bidder, // Object từ DB: { id, full_name } hoặc null
  bid_count = 0, // Integer từ DB
  created_at, // DateTime từ DB
  end_time, // DateTime từ DB
  status = 'Active', // Enum từ DB: Pending, Active, Sold, Expired, Removed
  onBid,
  onClick,
  className = '',
  ...props
}) => {
  // Get first image from array or use placeholder
  const getImageUrl = () => {
    if (!images) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
      } catch {
        return images;
      }
    }
    if (Array.isArray(images) && images.length > 0) return images[0];
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price from string (BigInt converted to string in API)
  const formatPrice = (priceString) => {
    if (!priceString) return '0.00';
    const price = parseFloat(priceString);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Button styles based on status from DB
  const getButtonStyles = () => {
    if (status === 'Sold' || status === 'Expired' || status === 'Removed') {
      return 'bg-slate-300 text-slate-500 cursor-not-allowed';
    }
    if (status === 'Pending') {
      return 'bg-yellow-500 text-white cursor-not-allowed';
    }
    return 'bg-slate-900 text-white hover:bg-primary hover:shadow-lg transition-all duration-300';
  };

  const getButtonText = () => {
    switch (status) {
      case 'Sold': return 'Sold';
      case 'Expired': return 'Auction Ended';
      case 'Removed': return 'Removed';
      case 'Pending': return 'Pending Approval';
      default: return 'Bid Now';
    }
  };


  const isNewProduct = () => {
    if (!created_at) return false;
    const postedTime = new Date(created_at).getTime();
    const oneHourInMs = 60 * 60 * 1000;
    // Check if the difference between current time and posted time is less than 1 hour
    return (Date.now() - postedTime) < oneHourInMs;
  };

  const isNew = isNewProduct();



  return (
    <div
      className={` bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group 
      ${onClick ? 'cursor-pointer' : ''} 
      ${className}
      ${isNew ? 'border-2 border-amber-500 ring-4 ring-amber-300/50 shadow-lg' : ''}`}
      onClick={onClick}
      {...props}
    >
      {/* Image Container */}
      <div className="relative h-64 bg-slate-100">

        {/* NEW BADGE: Display 'New' badge if posted recently */}
        {isNew && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md ">
              ✨ NEW 1HR
            </span>
          </div>
        )}

        <img
          src={getImageUrl()}
          alt={name || 'Product'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Countdown Timer - Bottom overlay */}
        {end_time && (
          <Countdown
            endDate={end_time}
            variant="overlay"
            showLabels={true}
            className="absolute left-0 right-0 bottom-0"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[3rem] leading-snug">
          {name}
        </h3>

        {/* Current Bidder & Bid Count */}
        <div className="flex items-center justify-between mb-3 text-xs">
          {current_bidder ? (
            <div className="flex items-center gap-1 text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{current_bidder.full_name}</span>
            </div>
          ) : (
            <div className="text-slate-400 italic">No bids yet</div>
          )}

          <div className="flex items-center gap-1 text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span className="font-medium">{bid_count} {bid_count === 1 ? 'bid' : 'bids'}</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-3">
          <p className="text-xs text-slate-600 font-medium mb-1">
            {current_price && current_price !== start_price ? 'Current bid:' : 'Starting bid:'}
          </p>
          <div className="text-2xl font-bold text-slate-900">
            ${formatPrice(current_price || start_price)}
          </div>
        </div>

        {/* Buy Now Price */}
        {buy_now_price ? (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 font-medium">Buy Now:</span>
              <span className="text-sm font-bold text-green-700">
                ${formatPrice(buy_now_price)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3 p-2 opacity-0 pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-xs">Placeholder</span>
              <span className="text-sm">$0.00</span>
            </div>
          </div>
        )}

        {/* Posted Date */}
        {created_at && (
          <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Posted: {formatDate(created_at)}</span>
          </div>
        )}

        {/* Bid Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBid && onBid();
          }}
          disabled={status !== 'Active'}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${getButtonStyles()}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

// ProductCard - Card sản phẩm đơn giản
export const ProductCard = ({
  image,
  title,
  price,
  category,
  onFavorite,
  onView,
  className = '',
  ...props
}) => {
  return (
    <Card
      variant="outlined"
      hoverable
      padding="none"
      className={className}
      {...props}
    >
      {/* Image */}
      <div className="relative group">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />

        {/* Action Buttons (Hover) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <span className="text-xs text-primary font-medium uppercase">
            {category}
          </span>
        )}
        <h3 className="text-base font-bold text-slate-900 mt-1 mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="text-xl font-bold text-primary">
          ${price?.toLocaleString() || '0.00'}
        </div>
      </div>
    </Card>
  );
};

// StatCard - Card hiển thị thống kê
export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <Card
      variant={variant}
      padding="default"
      className={className}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>

          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
