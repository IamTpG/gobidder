import React from "react";
import { Link } from "react-router-dom";

const ProfileSidebar = ({ activeKey, userRole }) => {
  const SIDEBAR_ITEMS = [
    {
      key: "information",
      label: "Personal Information",
      roles: ["Bidder", "Seller", "Admin"],
    },
    { key: "bids", label: "My Bids", roles: ["Bidder", "Seller"] },
    { key: "my-products", label: "My Products", roles: ["Seller"] },
    {
      key: "security",
      label: "Security",
      roles: ["Bidder", "Seller", "Admin"],
    },
    {
      key: "notifications",
      label: "Notifications",
      roles: ["Bidder", "Seller", "Admin"],
    },
    { key: "billing", label: "Billing", roles: ["Bidder", "Seller", "Admin"] },
  ];

  const visibleItems = SIDEBAR_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

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
