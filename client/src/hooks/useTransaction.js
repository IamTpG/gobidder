import { useState, useEffect, useCallback } from "react";

import { getTransaction, fetchTransactionMessages } from "../services/api";

export const useTransaction = (id) => {
  const [tx, setTx] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [txRes, msgRes] = await Promise.all([
        getTransaction(id),
        fetchTransactionMessages(id),
      ]);
      setTx(txRes.data || txRes);
      setMessages(msgRes.data || msgRes);
    } catch (err) {
      console.error(err);
      // Chỉ set error nếu chưa có data để tránh nhấp nháy khi polling lỗi nhẹ
      if (!tx)
        setError(err.response?.data?.message || "Failed to load transaction");
    } finally {
      setLoading(false);
    }
  }, [id, tx]);

  // Initial Load
  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  // Polling (mỗi 4s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, [id, fetchData]);

  return { tx, messages, loading, error, refresh: fetchData };
};
