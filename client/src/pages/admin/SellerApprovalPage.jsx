import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Spinner from "../../components/common/Spinner";

const SellerApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/users/admin/seller-requests");
      setRequests(response.data);
    } catch (err) {
      setError("Failed to load seller requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {


    try {
      await api.post(`/users/admin/seller-requests/${requestId}/approve`);
      setRequests(requests.filter((req) => req.id !== requestId));
      setNotification({
        type: "success",
        message: "Seller request approved successfully!",
      });
    } catch (err) {
      console.error("Failed to approve request:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to approve request.",
      });
    }
  };

  const handleReject = async (requestId) => {


    try {
      await api.post(`/users/admin/seller-requests/${requestId}/reject`);
      setRequests(requests.filter((req) => req.id !== requestId));
      setNotification({ type: "success", message: "Seller request rejected." });
    } catch (err) {
      console.error("Failed to reject request:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to reject request.",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Seller Approval Requests
      </h2>

      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No pending seller requests
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Requested At</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {request.user.full_name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {request.user.email}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerApprovalPage;
