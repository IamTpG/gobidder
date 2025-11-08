import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  // Variant styles - dựa trên theme primary #01AA85
  const variants = {
    // Primary - Màu chủ đạo của theme
    primary: `
      bg-primary text-white
      hover:bg-[#019974] hover:shadow-lg
      focus:ring-primary/50
      active:scale-95
    `,
    
    // Secondary - Màu tối (dựa theo logo PROBID)
    secondary: `
      bg-slate-900 text-white
      hover:bg-slate-800 hover:shadow-lg
      focus:ring-slate-900/50
      active:scale-95
    `,
    
    // Outline Primary - Viền màu primary
    outline: `
      border-2 border-primary text-primary bg-white
      hover:bg-primary hover:text-white hover:shadow-md
      focus:ring-primary/50
      active:scale-95
    `,
    
    // Outline Secondary
    outlineSecondary: `
      border-2 border-slate-900 text-slate-900 bg-white
      hover:bg-slate-900 hover:text-white hover:shadow-md
      focus:ring-slate-900/50
      active:scale-95
    `,
    
    // Ghost - Trong suốt
    ghost: `
      bg-transparent text-slate-700
      hover:bg-slate-100
      focus:ring-slate-300
      active:scale-95
    `,
    
    // Success - Màu xanh lá nhạt (gradient trong footer)
    success: `
      bg-gradient-to-r from-[#18A5A7] to-[#5fd7c0] text-white
      hover:from-[#159a9c] hover:to-[#4fc7af] hover:shadow-lg
      focus:ring-[#18A5A7]/50
      active:scale-95
    `,
    
    // Danger - Màu đỏ
    danger: `
      bg-red-600 text-white
      hover:bg-red-700 hover:shadow-lg
      focus:ring-red-500/50
      active:scale-95
    `,
    
    // Warning
    warning: `
      bg-yellow-500 text-white
      hover:bg-yellow-600 hover:shadow-lg
      focus:ring-yellow-500/50
      active:scale-95
    `,
    
    // Link style
    link: `
      bg-transparent text-primary underline-offset-4
      hover:underline
      focus:ring-0
    `,
  };

  // Size styles
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="inline-flex">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="inline-flex">{icon}</span>
      )}
    </button>
  );
};

export default Button;
