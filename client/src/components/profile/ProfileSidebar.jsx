import React from "react";

const SIDEBAR_ITEMS = [
  { key: "information", label: "Information" },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "billing", label: "Billing" },
];

const ProfileSidebar = ({ activeKey, onItemClick }) => {
  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:w-64">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        My Account
      </h3>
      <nav className="space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:text-primary hover:bg-primary/10"
              }`}
              type="button"
              onClick={() => onItemClick?.(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
