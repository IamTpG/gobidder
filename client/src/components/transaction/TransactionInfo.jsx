import React from "react";

const TransactionInfo = ({ tx }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-2">Transaction Details</h2>
      <p className="text-sm text-gray-500 mb-6">
        Status: <span className="font-semibold text-primary">{tx.status}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-900">Product</h3>
          <p className="text-sm font-medium">{tx.product?.name}</p>
          <p className="text-xs text-gray-500 mt-2">
            Final price:{" "}
            <span className="text-primary font-bold">
              {tx.final_price?.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-900">Participants</h3>
          <p className="text-sm">
            Seller: <span className="font-medium">{tx.seller?.full_name}</span>
          </p>
          <p className="text-sm">
            Buyer: <span className="font-medium">{tx.winner?.full_name}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default TransactionInfo;
