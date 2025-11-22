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

export default api;
