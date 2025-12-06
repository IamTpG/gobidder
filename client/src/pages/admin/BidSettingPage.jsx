import React, { useState, useEffect } from "react";

const BidSettingPage = () => {
  const [highlightDuration, setHighlightDuration] = useState(60);
  const [snipingTime, setSnipingTime] = useState(5);
  const [extendTime, setExtendTime] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    highlightDuration: "",
    snipingTime: "",
    extendTime: ""
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = {
          data: {
            new_product_duration: 60,
            anti_sniping_trigger: 5,
            anti_sniping_extension: 3
          }
        };
        
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

  const validateField = (name, value) => {
    const numValue = parseFloat(value);
    
    if (value === "" || value === null) {
      return "This field is required";
    }
    
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    if (numValue < 0) {
      return "Value cannot be negative";
    }
    
    if (numValue === 0) {
      return "Value must be greater than 0";
    }
    
    if (!Number.isInteger(numValue)) {
      return "Please enter a whole number";
    }
    
    return "";
  };

  const handleHighlightChange = (e) => {
    const value = e.target.value;
    setHighlightDuration(value);
    const error = validateField("highlightDuration", value);
    setValidationErrors(prev => ({ ...prev, highlightDuration: error }));
  };

  const handleSnipingTimeChange = (e) => {
    const value = e.target.value;
    setSnipingTime(value);
    const error = validateField("snipingTime", value);
    setValidationErrors(prev => ({ ...prev, snipingTime: error }));
  };

  const handleExtendTimeChange = (e) => {
    const value = e.target.value;
    setExtendTime(value);
    const error = validateField("extendTime", value);
    setValidationErrors(prev => ({ ...prev, extendTime: error }));
  };

  const handleSave = async () => {
    // Validate all fields before saving
    const errors = {
      highlightDuration: validateField("highlightDuration", highlightDuration),
      snipingTime: validateField("snipingTime", snipingTime),
      extendTime: validateField("extendTime", extendTime)
    };
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    if (Object.values(errors).some(error => error !== "")) {
      setErrorMessage("Please fix all validation errors before saving.");
      return;
    }

    setIsLoading(true);
    setSaveMessage("");
    setErrorMessage("");
    
    try {
      const payload = {
        highlight_duration: parseInt(highlightDuration),
        anti_sniping_trigger: parseInt(snipingTime),
        anti_sniping_extension: parseInt(extendTime),
      };
      
      console.log("Configuration updated successfully!", payload);
      setSaveMessage("Configuration updated successfully!");
      
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure global auction parameters</p>
        </div>

        {saveMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {saveMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">New Product Highlight</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlight Duration (minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={highlightDuration}
                onChange={handleHighlightChange}
                min="1"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-16 ${
                  validationErrors.highlightDuration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="E.g., 60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                minutes
              </span>
            </div>
            {validationErrors.highlightDuration && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.highlightDuration}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Newly created products will be highlighted as "New Arrival" for this duration.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Bid Extension (Anti-Sniping)</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Window (Last minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={snipingTime}
                onChange={handleSnipingTimeChange}
                min="1"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16 ${
                  validationErrors.snipingTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                mins left
              </span>
            </div>
            {validationErrors.snipingTime && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.snipingTime}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              If a bid is placed within the last <span className="font-medium">{snipingTime}</span> minutes...
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Extension (Add minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={extendTime}
                onChange={handleExtendTimeChange}
                min="1"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-16 ${
                  validationErrors.extendTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                mins added
              </span>
            </div>
            {validationErrors.extendTime && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.extendTime}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              ...the auction end time will be extended by <span className="font-medium">{extendTime}</span> minutes.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidSettingPage;