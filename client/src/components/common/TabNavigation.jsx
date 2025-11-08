import React from 'react';

const TabNavigation = ({ 
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = ''
}) => {
  const variants = {
    underline: {
      container: 'border-b-2 border-gray-200',
      tabsWrapper: 'flex gap-8',
      tab: 'pb-3 text-sm font-medium border-b-2 transition-colors duration-200 -mb-0.5',
      active: 'border-gray-900 text-gray-900',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900',
    },
    pills: {
      container: 'bg-gray-100 rounded-xl p-1',
      tabsWrapper: 'flex gap-2',
      tab: 'px-6 py-2.5 text-sm font-medium capitalize rounded-lg transition-all duration-200',
      active: 'bg-white text-primary shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    buttons: {
      container: '',
      tabsWrapper: 'flex gap-3',
      tab: 'px-6 py-2.5 text-sm font-medium capitalize rounded-xl border-2 transition-all duration-200',
      active: 'bg-primary border-primary text-white shadow-md',
      inactive: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900',
    },
  };

  const style = variants[variant] || variants.underline;

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.tabsWrapper}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              ${style.tab}
              ${activeTab === tab.key ? style.active : style.inactive}
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
