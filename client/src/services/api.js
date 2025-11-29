import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// API functions
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Q&A API functions
export const createProductQuestion = async (productId, questionData) => {
  const response = await api.post(
    `/products/${productId}/questions`,
    questionData,
  );
  return response.data;
};

export const answerProductQuestion = async (
  productId,
  questionId,
  answerData,
) => {
  const response = await api.post(
    `/products/${productId}/questions/${questionId}/answer`,
    answerData,
  );
  return response.data;
};

export const placeBid = async (productId, maxPrice) => {
  const response = await api.post(`/products/${productId}/bid`, { maxPrice });
  return response.data;
};

export const getMyAutoBid = async (productId) => {
  const response = await api.get(`/bid-history/me/product/${productId}`, {
    productId,
  });
  return response.data;
};

export const getMyBids = async () => {
  const response = await api.get("/users/me/bids/active");
  return response.data;
};

export const getMyWonProducts = async () => {
  const response = await api.get("/users/me/bids/won");
  return response.data;
};

export default api;

// Transaction endpoints (simulated payments)
export const createTransactionForProduct = async (productId) => {
  const response = await api.post(`/transactions/create-for-product/${productId}`);
  return response.data;
};

export const getTransactionByProduct = async (productId) => {
  const response = await api.get(`/transactions/product/${productId}`);
  return response.data;
};

export const getTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

export const uploadPayment = async (transactionId, formData) => {
  const response = await api.post(`/transactions/${transactionId}/payment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadShipping = async (transactionId, formData) => {
  const response = await api.post(`/transactions/${transactionId}/shipping`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const confirmReceipt = async (transactionId) => {
  const response = await api.post(`/transactions/${transactionId}/confirm-receipt`);
  return response.data;
};

export const cancelTransaction = async (transactionId, reason) => {
  const response = await api.post(`/transactions/${transactionId}/cancel`, { reason });
  return response.data;
};

export const fetchTransactionMessages = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}/messages`);
  return response.data;
};

export const sendTransactionMessage = async (transactionId, payload) => {
  const response = await api.post(`/transactions/${transactionId}/messages`, payload);
  return response.data;
};

export const postTransactionRating = async (transactionId, payload) => {
  const response = await api.post(`/transactions/${transactionId}/rating`, payload);
  return response.data;
};
