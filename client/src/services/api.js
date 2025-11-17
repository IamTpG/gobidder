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

export default api;
