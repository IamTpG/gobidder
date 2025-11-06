import React from 'react';

const Badge = ({ 
  children,
  variant = 'default',
  size = 'md',
  icon,
  rounded = 'full',
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center gap-1.5
    font-medium
    transition-all duration-200
  `;

  // Variant styles - dựa trên theme primary #01AA85
  const variants = {
    // Default - Slate gray
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    
    // Primary - Màu chủ đạo
    primary: 'bg-primary text-white',
    
    // Success - Xanh lá
    success: 'bg-green-600 text-white',
    
    // Warning - Vàng
    warning: 'bg-yellow-500 text-white',
    
    // Danger/Live - Đỏ (cho Live badge)
    danger: 'bg-red-600 text-white',
    live: 'bg-red-600 text-white',
    
    // Info/Upcoming - Xanh dương (cho Upcoming badge)
    info: 'bg-blue-600 text-white',
    upcoming: 'bg-blue-600 text-white',
    
    // Ended - Xám
    ended: 'bg-slate-600 text-white',
    
    // Outline variants
    outlinePrimary: 'bg-transparent border-2 border-primary text-primary',
    outlineSuccess: 'bg-transparent border-2 border-green-600 text-green-600',
    outlineWarning: 'bg-transparent border-2 border-yellow-600 text-yellow-600',
    outlineDanger: 'bg-transparent border-2 border-red-600 text-red-600',
    
    // Light variants (background nhạt)
    lightPrimary: 'bg-primary/10 text-primary',
    lightSuccess: 'bg-green-100 text-green-700',
    lightWarning: 'bg-yellow-100 text-yellow-700',
    lightDanger: 'bg-red-100 text-red-700',
    lightInfo: 'bg-blue-100 text-blue-700',
    
    // Gradient (như trong theme)
    gradient: 'bg-gradient-to-r from-[#18A5A7] to-[#5fd7c0] text-white',
  };

  // Size styles
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundedStyles[rounded]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
};

// StatusBadge - Badge chuyên dụng cho trạng thái đấu giá
export const StatusBadge = ({ status = 'live', className = '', ...props }) => {
  const statusConfig = {
    live: {
      label: 'Live',
      variant: 'live',
      icon: '🔴',
    },
    upcoming: {
      label: 'Upcoming',
      variant: 'upcoming',
      icon: '📅',
    },
    ended: {
      label: 'Ended',
      variant: 'ended',
      icon: '⏹️',
    },
  };

  const config = statusConfig[status] || statusConfig.live;

  return (
    <Badge 
      variant={config.variant} 
      icon={config.icon}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

// NumberBadge - Badge hiển thị số (cho notification, cart...)
export const NumberBadge = ({ 
  count = 0, 
  max = 99,
  variant = 'danger',
  size = 'sm',
  className = '',
  ...props 
}) => {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <Badge 
      variant={variant} 
      size={size}
      className={`min-w-[20px] ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

// CategoryBadge - Badge cho categories/tags
export const CategoryBadge = ({ 
  children,
  color = 'primary',
  className = '',
  ...props 
}) => {
  return (
    <Badge 
      variant={`light${color.charAt(0).toUpperCase() + color.slice(1)}`}
      size="sm"
      rounded="md"
      className={className}
      {...props}
    >
      {children}
    </Badge>
  );
};

// DotBadge - Badge chỉ có dot (không có text)
export const DotBadge = ({ 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-primary',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    live: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <span 
      className={`inline-block rounded-full ${dotSizes[size]} ${dotColors[variant]} ${className}`}
      {...props}
    />
  );
};

export default Badge;
