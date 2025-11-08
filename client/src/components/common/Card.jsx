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
  image,
  title,
  currentBid,
  startingBid,
  lotNumber,
  status = 'live', // live, upcoming, ended
  timeLeft, // { days, hours, minutes, seconds } - deprecated, use endDate instead
  endDate, // ISO date string for automatic countdown
  onBid,
  onClick,
  onFavorite,
  isFavorited = false,
  buttonVariant = 'default', // 'default' or 'primary'
  className = '',
  ...props
}) => {
  // Status badge styles
  const statusConfig = {
    live: {
      label: 'Live',
      className: 'bg-red-600 text-white',
      dotColor: 'bg-white',
    },
    upcoming: {
      label: 'Upcoming',
      className: 'bg-blue-600 text-white',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    ended: {
      label: 'Ended',
      className: 'bg-slate-600 text-white',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];
  
  // Button styles based on variant and status
  const getButtonStyles = () => {
    if (status === 'ended') {
      return 'bg-slate-300 text-slate-500 cursor-not-allowed';
    }
    
    // Mặc định: màu đen, hover chuyển sang primary
    return 'bg-slate-900 text-white hover:bg-primary hover:shadow-lg transition-all duration-300';
  };

  return (
    <div 
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {/* Image Container */}
      <div className="relative h-64 bg-slate-100">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge - Top Left */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${config.className}`}>
          {status === 'live' ? (
            <svg className="w-2 h-2" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : (
            config.icon
          )}
          <span>{config.label}</span>
        </div>
        
        {/* Lot Number Badge - Top Right */}
        {lotNumber && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm" style={{ backgroundColor: '#747474' }}>
            Lot # {lotNumber}
          </div>
        )}

        {/* Countdown Timer - Bottom overlay with rounded white background */}
        {(timeLeft || endDate) && (
          <Countdown 
            endDate={endDate}
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
          {title}
        </h3>

        {/* Price Section */}
        <div className="mb-4">
          <p className="text-xs text-slate-600 font-medium mb-1">
            {startingBid ? 'Starting bid:' : 'Current bid:'}
          </p>
          <div className="text-2xl font-bold text-slate-900">
            ${(currentBid || startingBid)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>

        {/* Bid Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBid && onBid();
          }}
          disabled={status === 'ended'}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${getButtonStyles()}`}
        >
          {status === 'ended' ? 'Auction Ended' : 'Bid Now'}
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
