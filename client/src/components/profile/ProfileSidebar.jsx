import React from "react";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
  { key: "information", label: "Personal Information" },
  { key: "bids", label: "My Bids" },
  {
    key: "products",
    label: "My Products",
    requireRole: ["Seller", "ExpiredSeller"],
  },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "billing", label: "Billing" },
];

const ProfileSidebar = ({ activeKey, userRole }) => {
  // Filter items dựa trên role
  const visibleItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.requireRole) {
      // Support both string and array for requireRole
      const allowedRoles = Array.isArray(item.requireRole)
        ? item.requireRole
        : [item.requireRole];
      return allowedRoles.includes(userRole);
    }
    return true;
  });

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:w-64 h-fit sticky top-24">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-4">
        Account Settings
      </h3>
      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Link
              key={item.key}
              to={`/profile?tab=${item.key}`}
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#01AA85]/10 text-[#01AA85] shadow-sm"
                  : "text-gray-600 hover:text-[#01AA85] hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
