import React, { useState, useEffect } from "react";
import api from "../../services/api";

const BidSettingPage = () => {
  const [highlightDuration, setHighlightDuration] = useState(60);
  const [snipingTime, setSnipingTime] = useState(5);
  const [extendTime, setExtendTime] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await api.get("/admin/system-config");
        if (response.data) {
          setHighlightDuration(response.data.new_product_duration || 60);
          setSnipingTime(response.data.anti_sniping_trigger || 5);
          setExtendTime(response.data.anti_sniping_extension || 3);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setErrorMessage("Failed to load configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveMessage("");
    setErrorMessage("");
    
    try {
      const payload = {
        highlight_duration: parseInt(highlightDuration),
        anti_sniping_trigger: parseInt(snipingTime),
        anti_sniping_extension: parseInt(extendTime),
      };

      const response = await api.put("/admin/system-config", payload);
      console.log("Configuration updated successfully!", response.data);
      setSaveMessage("Configuration updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setErrorMessage("An error occurred while saving configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure global auction parameters</p>
          </div>

          {/* Success Message */}
          {saveMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{saveMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* New Product Highlight Section */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">✨</span>
              New Product Highlight
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlight Duration (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={highlightDuration}
                    onChange={(e) => setHighlightDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none pr-16"
                    placeholder="E.g., 60"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    minutes
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Newly created products will be highlighted as "New Arrival" for this duration.
                </p>
              </div>
            </div>
          </div>

          {/* Bid Extension Section */}
          <div className="mb-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">⏱️</span>
              Bid Extension (Anti-Sniping)
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Window (Last minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={snipingTime}
                    onChange={(e) => setSnipingTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    mins left
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  If a bid is placed within the last{" "}
                  <span className="font-semibold text-orange-600">{snipingTime}</span> minutes...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Extension (Add minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={extendTime}
                    onChange={(e) => setExtendTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    mins added
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ...the auction end time will be extended by{" "}
                  <span className="font-semibold text-orange-600">{extendTime}</span> minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidSettingPage;