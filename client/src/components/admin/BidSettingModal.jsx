import React, { useState } from "react";

const BidSettingModal = ({ isOpen, onClose }) => {
  const [highlightDuration, setHighlightDuration] = useState(60);
  const [snipingTime, setSnipingTime] = useState(5);
  const [extendTime, setExtendTime] = useState(3);

  if (!isOpen) return null;

  const handleSave = () => {
    console.log({
      highlight_duration: highlightDuration,
      anti_sniping_trigger: snipingTime,
      anti_sniping_extension: extendTime
    });
    onClose();
  };

  return (
    <>
      {/* CSS để ẩn scrollbar nhưng vẫn giữ chức năng cuộn */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 m-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure global auction parameters</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* 1. SETTING THỜI GIAN HIGHLIGHT SẢN PHẨM MỚI */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-500 w-2 h-2 rounded-full mr-2"></span>
                New Product Highlight
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlight Duration (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={highlightDuration}
                    onChange={(e) => setHighlightDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none pr-16"
                    placeholder="E.g., 60"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    minutes
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Newly created products will be highlighted as "New Arrival" for this duration.
                </p>
              </div>
            </div>

            {/* 2. SETTING ĐẤU GIÁ BÙ GIỜ (ANTI-SNIPING) */}
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-orange-500 w-2 h-2 rounded-full mr-2"></span>
                Bid Extension (Anti-Sniping)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Điều kiện kích hoạt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Window (Last minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={snipingTime}
                      onChange={(e) => setSnipingTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16"
                    />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      mins left
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    If a bid is placed within the last <b>{snipingTime} minutes</b>...
                  </p>
                </div>

                {/* Thời gian cộng thêm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Extension (Add minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={extendTime}
                      onChange={(e) => setExtendTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      mins added
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ...the auction end time will be extended by <b>{extendTime} minutes</b>.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BidSettingModal;