import React, { useState } from 'react';

const CategoryFilter = ({ 
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  className = '',
  ...props 
}) => {
  const [selected, setSelected] = useState(activeCategory);

  const handleCategoryClick = (categoryId) => {
    setSelected(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  // Default categories nếu không truyền vào
  const defaultCategories = [
    { id: 'all', label: 'All' },
    { id: 'antiques', label: 'Antiques' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'books-comic', label: 'Books & Comic' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'real-estate', label: 'Real Estate' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div 
      className={`flex flex-wrap items-center gap-3 ${className}`}
      {...props}
    >
      {displayCategories.map((category) => {
        const isActive = selected === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              px-6 py-2.5 rounded-full font-medium text-sm
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${
                isActive
                  ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-primary hover:text-primary hover:shadow-sm'
              }
            `}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

// Variant: Compact style (cho mobile hoặc sidebar)
export const CompactCategoryFilter = ({ 
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  className = '',
  ...props 
}) => {
  const [selected, setSelected] = useState(activeCategory);

  const handleCategoryClick = (categoryId) => {
    setSelected(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const defaultCategories = [
    { id: 'all', label: 'All', icon: '🔥' },
    { id: 'antiques', label: 'Antiques', icon: '🏺' },
    { id: 'automotive', label: 'Automotive', icon: '🚗' },
    { id: 'books-comic', label: 'Books & Comic', icon: '📚' },
    { id: 'digital-art', label: 'Digital Art', icon: '🎨' },
    { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div 
      className={`flex flex-col gap-2 ${className}`}
      {...props}
    >
      {displayCategories.map((category) => {
        const isActive = selected === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
              transition-all duration-200 ease-in-out text-left
              ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-primary'
              }
            `}
          >
            {category.icon && <span className="text-lg">{category.icon}</span>}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Variant: Tab style
export const TabCategoryFilter = ({ 
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  className = '',
  ...props 
}) => {
  const [selected, setSelected] = useState(activeCategory);

  const handleCategoryClick = (categoryId) => {
    setSelected(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const defaultCategories = [
    { id: 'all', label: 'All' },
    { id: 'antiques', label: 'Antiques' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'books-comic', label: 'Books & Comic' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'real-estate', label: 'Real Estate' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div 
      className={`inline-flex bg-slate-100 rounded-full p-1 ${className}`}
      {...props}
    >
      {displayCategories.map((category) => {
        const isActive = selected === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              px-5 py-2 rounded-full font-medium text-sm
              transition-all duration-200 ease-in-out
              ${
                isActive
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }
            `}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

// Variant: Dropdown style (cho mobile)
export const DropdownCategoryFilter = ({ 
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  className = '',
  ...props 
}) => {
  const [selected, setSelected] = useState(activeCategory);
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId) => {
    setSelected(categoryId);
    setIsOpen(false);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const defaultCategories = [
    { id: 'all', label: 'All Categories' },
    { id: 'antiques', label: 'Antiques' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'books-comic', label: 'Books & Comic' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'real-estate', label: 'Real Estate' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  const selectedCategory = displayCategories.find(cat => cat.id === selected);

  return (
    <div className={`relative ${className}`} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:border-primary transition-colors"
      >
        <span>{selectedCategory?.label || 'Select Category'}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden z-10 animate-fadeIn">
          {displayCategories.map((category) => {
            const isActive = selected === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  w-full text-left px-4 py-3 font-medium text-sm
                  transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
