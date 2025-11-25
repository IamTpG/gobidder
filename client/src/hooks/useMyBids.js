import { useState, useEffect } from "react";
import { getMyBids, getMyWonProducts } from "../services/api";

export const useMyBids = () => {
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'won'
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data = [];
        if (activeTab === "active") {
          // API lấy danh sách đang đấu giá
          data = await getMyBids();
        } else if (activeTab === "won") {
          // API lấy danh sách đã thắng
          data = await getMyWonProducts();
        }
        setBids(data || []);
      } catch (err) {
        console.error("Error fetching bids:", err);
        setError(err.response?.data?.message || "Failed to load bid history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBids();
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
    bids,
    isLoading,
    error,
  };
};
