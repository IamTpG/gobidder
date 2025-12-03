export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price || 0);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const maskUserName = (userName) => {
  if (!userName || typeof userName !== "string") return "*****";
  const maskLength = Math.floor(userName.length * 0.8);
  const visiblePart = userName.substring(maskLength);
  return "*****" + visiblePart;
};

export const calculateRating = (plus, minus) => {
  const total = plus + minus;
  if (total === 0) return "No ratings";
  const percentage = ((plus / total) * 100).toFixed(1);
  return `${plus}/${total} (${percentage}%)`;
};
