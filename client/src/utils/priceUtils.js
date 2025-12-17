/**
 * Format a number as a price with thousand separators and up to 2 decimal places
 * @param {number|string} value - The price value to format
 * @returns {string} Formatted price string (e.g., "1,000,000.23")
 */
export const formatPrice = (value) => {
  if (value === "" || value === null || value === undefined) return "";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "";

  // Format with thousand separators and up to 2 decimal places
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Validate that a number has no more than the specified decimal places
 * @param {number|string} value - The value to validate
 * @param {number} maxDecimals - Maximum allowed decimal places (default: 2)
 * @returns {boolean} True if valid, false otherwise
 */
export const validateDecimalPlaces = (value, maxDecimals = 2) => {
  if (value === "" || value === null || value === undefined) return true;

  const stringValue = String(value);
  const decimalIndex = stringValue.indexOf(".");

  if (decimalIndex === -1) return true; // No decimals

  const decimalPlaces = stringValue.length - decimalIndex - 1;
  return decimalPlaces <= maxDecimals;
};

/**
 * Parse a formatted price string back to a number
 * @param {string} formattedValue - Formatted price string (e.g., "1,000,000.23")
 * @returns {number} Parsed number value
 */
export const parseFormattedPrice = (formattedValue) => {
  if (!formattedValue) return 0;

  // Remove thousand separators (commas)
  const cleanedValue = String(formattedValue).replace(/,/g, "");
  const numValue = parseFloat(cleanedValue);

  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Validate and format a price input, preventing more than 2 decimal places
 * @param {string} value - The input value
 * @returns {object} Object with {isValid: boolean, errorMessage: string}
 */
export const validatePriceInput = (value) => {
  if (!value) return { isValid: true, errorMessage: "" };

  if (!validateDecimalPlaces(value, 2)) {
    return {
      isValid: false,
      errorMessage: "Price cannot have more than 2 decimal places",
    };
  }

  return { isValid: true, errorMessage: "" };
};
