import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000";

const BidSettingPage = () => {
  const [highlightDuration, setHighlightDuration] = useState(60);
  const [snipingTime, setSnipingTime] = useState(5);
  const [extendTime, setExtendTime] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/system-config`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
          setHighlightDuration(data.new_product_duration || 60);
          setSnipingTime(data.anti_sniping_trigger || 5);
          setExtendTime(data.anti_sniping_extension || 3);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        highlight_duration: parseInt(highlightDuration),
        anti_sniping_trigger: parseInt(snipingTime),
        anti_sniping_extension: parseInt(extendTime),
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/system-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save");
      }

      const result = await response.json();

      console.log("Cập nhật cấu hình thành công!", result);
      alert("Cập nhật cấu hình thành công!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Có lỗi xảy ra khi lưu cấu hình.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure global auction parameters
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-500 w-2 h-2 rounded-full mr-2"></span>
              New Product Highlight
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Duration (minutes)
              </label>
              <div className="relative max-w-xs">
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
                Newly created products will be highlighted as "New Arrival" for
                this duration.
              </p>
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-orange-500 w-2 h-2 rounded-full mr-2"></span>
              Bid Extension (Anti-Sniping)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  If a bid is placed within the last{" "}
                  <b>{snipingTime} minutes</b>...
                </p>
              </div>

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
                  ...the auction end time will be extended by{" "}
                  <b>{extendTime} minutes</b>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm flex items-center ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidSettingPage;
