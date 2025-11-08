import React, { useState } from 'react';

const Input = ({ 
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  className = '',
  icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine input type
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  // Container styles
  const containerStyles = `
    ${fullWidth ? 'w-full' : 'w-auto'}
  `;

  // Label styles
  const labelStyles = `
    block text-sm font-medium text-slate-700 mb-2
    ${disabled ? 'opacity-50' : ''}
  `;

  // Input wrapper styles
  const inputWrapperStyles = `
    relative flex items-center
    ${fullWidth ? 'w-full' : ''}
  `;

  // Input base styles
  const inputBaseStyles = `
    w-full px-4 py-3
    text-sm text-slate-800
    bg-white/80
    border rounded-xl
    outline-none
    transition-all duration-300
    placeholder:text-slate-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${icon && iconPosition === 'left' ? 'pl-11' : ''}
    ${icon && iconPosition === 'right' ? 'pr-11' : ''}
    ${showPasswordToggle ? 'pr-11' : ''}
  `;

  // Border and focus styles based on state
  const getBorderStyles = () => {
    if (error) {
      return `
        border-red-300
        focus:border-red-500 focus:ring-2 focus:ring-red-500/20
      `;
    }
    if (isFocused) {
      return `
        border-primary
        ring-2 ring-primary/20
      `;
    }
    return `
      border-slate-300
      hover:border-slate-400
      focus:border-primary focus:ring-2 focus:ring-primary/20
    `;
  };

  // Icon wrapper styles
  const iconWrapperStyles = `
    absolute
    ${iconPosition === 'left' ? 'left-3' : 'right-3'}
    top-1/2 -translate-y-1/2
    flex items-center justify-center
    text-slate-400
    pointer-events-none
  `;

  // Password toggle button styles
  const passwordToggleStyles = `
    absolute right-3 top-1/2 -translate-y-1/2
    flex items-center justify-center
    text-slate-400 hover:text-slate-600
    cursor-pointer
    transition-colors duration-200
  `;

  // Error message styles
  const errorStyles = `
    mt-1.5 text-sm text-red-600
    flex items-center gap-1
  `;

  // Helper text styles
  const helperTextStyles = `
    mt-1.5 text-sm text-slate-500
  `;

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className={inputWrapperStyles}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={iconWrapperStyles}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className={`${inputBaseStyles} ${getBorderStyles()}`}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && !showPasswordToggle && (
          <div className={iconWrapperStyles}>
            {icon}
          </div>
        )}

        {/* Password Toggle Button */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={passwordToggleStyles}
            tabIndex={-1}
          >
            {showPassword ? (
              // Eye Slash Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Eye Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className={errorStyles}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={helperTextStyles}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// Search Input - Input chuyên dụng cho search
export const SearchInput = ({ 
  placeholder = "Search...",
  onSearch,
  className = '',
  ...props 
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch?.('');
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        iconPosition="left"
        {...props}
      />
      
      {/* Clear Button */}
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
};

export default Input;
