import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransaction,
  uploadPayment,
  uploadShipping,
  confirmReceipt,
  cancelTransaction,
  fetchTransactionMessages,
  sendTransactionMessage,
  postTransactionRating,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const TransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentFile, setPaymentFile] = useState(null);
  const [shippingFile, setShippingFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [shippingPreview, setShippingPreview] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [isUploadingShipping, setIsUploadingShipping] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isPostingRating, setIsPostingRating] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingScore, setRatingScore] = useState(null);
  const [ratingComment, setRatingComment] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getTransaction(id);
        setTx(res.data || res);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
    // simple polling for messages and status
    const poll = setInterval(async () => {
      try {
        if (id) {
          const r = await getTransaction(id);
          setTx(r.data || r);
          const m = await fetchTransactionMessages(id);
          setMessages(m.data || m);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(poll);
  }, [id]);

  // Keep all hooks in same order and run unconditionally.
  // cleanup object URLs for previews when component unmounts
  useEffect(() => {
    return () => {
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
      if (shippingPreview) URL.revokeObjectURL(shippingPreview);
    };
  }, [paymentPreview, shippingPreview]);

  // revoke previous preview when payment file changes
  useEffect(() => {
    return () => {
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
    };
  }, [paymentPreview]);

  // revoke previous preview when shipping file changes
  useEffect(() => {
    return () => {
      if (shippingPreview) URL.revokeObjectURL(shippingPreview);
    };
  }, [shippingPreview]);

  if (loading) return <div className="p-6">Loading transaction...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tx) return <div className="p-6">No transaction found.</div>;

  const isSeller = user?.id === tx.seller_id;
  const isWinner = user?.id === tx.winner_id;
  const myRating = tx.ratings?.find((r) => r.rater_id === user?.id);

  const handleUploadPayment = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsUploadingPayment(true);
      const form = new FormData();
      if (paymentFile) form.append("invoice", paymentFile);
      form.append("shipping_address", shippingAddress);
      await uploadPayment(tx.id, form);
      const r = await getTransaction(id);
      setTx(r.data || r);
      setSuccessMessage("Payment proof uploaded — waiting for seller confirmation.");
      setPaymentFile(null);
      setPaymentPreview(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to upload payment");
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const handleUploadShipping = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsUploadingShipping(true);
      const form = new FormData();
      if (shippingFile) form.append("invoice", shippingFile);
      await uploadShipping(tx.id, form);
      const r = await getTransaction(id);
      setTx(r.data || r);
      setSuccessMessage("Shipping proof uploaded — waiting for buyer confirmation.");
      setShippingFile(null);
      setShippingPreview(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to upload shipping");
    } finally {
      setIsUploadingShipping(false);
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsConfirmingReceipt(true);
      await confirmReceipt(tx.id);
      const r = await getTransaction(id);
      setTx(r.data || r);
      setSuccessMessage("Receipt confirmed — transaction completed.");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to confirm receipt");
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const handleCancel = async () => {
    // Open inline cancel form instead of prompt
    setShowCancelForm(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsCancelling(true);
      await cancelTransaction(tx.id, cancelReason || "Người thắng không thanh toán");
      const r = await getTransaction(id);
      setTx(r.data || r);
      setSuccessMessage("Transaction cancelled successfully.");
      setShowCancelForm(false);
      setCancelReason("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to cancel");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSendingMessage(true);
      const receiver = isSeller ? tx.winner_id : tx.seller_id;
      await sendTransactionMessage(tx.id, { receiverId: receiver, message: messageText });
      setMessageText("");
      const m = await fetchTransactionMessages(id);
      setMessages(m.data || m);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handlePostRating = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsPostingRating(true);
      await postTransactionRating(tx.id, { score: ratingScore, comment: ratingComment });
      const r = await getTransaction(id);
      setTx(r.data || r);
      setSuccessMessage("Rating posted");
      setShowRatingForm(false);
      setRatingComment("");
      setRatingScore(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsPostingRating(false);
    }
  };

  // (cleanup hooks moved earlier so they are unconditionally declared)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-4 underline">Back</button>

      <h2 className="text-xl font-bold mb-2">Finish payment</h2>
      <p className="text-sm text-gray-500 mb-6">Transaction status: <strong>{tx.status}</strong></p>

      {/* Success / Error banners */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Product</h3>
          <p className="text-sm">{tx.product?.name}</p>
          <p className="text-xs text-gray-400 mt-2">Final price: {tx.final_price?.toString?.() ?? tx.final_price}</p>
        </div>

        <div className="bg-white border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Participants</h3>
          <p className="text-sm">Seller: {tx.seller?.full_name}</p>
          <p className="text-sm">Buyer: {tx.winner?.full_name}</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 border rounded-lg shadow-sm">
        <h4 className="font-semibold mb-2">Progress</h4>
        <ol className="space-y-3">
          <li>
            <div className="flex items-center justify-between">
              <div>
                <strong>1. Buyer provides payment proof & shipping address</strong>
                <div className="text-xs text-gray-500">Status: {tx.status === 'PendingPayment' ? 'Waiting' : (tx.status === 'PendingShipping' ? 'Done' : '')}</div>
              </div>
                  {tx.status === 'PendingPayment' && isWinner && (
                <div className="w-full mt-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium">Payment proof (image)</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setPaymentFile(f); if (f) setPaymentPreview(URL.createObjectURL(f)); }} />
                    {paymentPreview && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Preview</p>
                        <img src={paymentPreview} alt="payment preview" className="max-h-40 rounded border" />
                      </div>
                    )}
                    {tx.payment_invoice_url && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Uploaded payment proof</p>
                        <a href={tx.payment_invoice_url} target="_blank" rel="noreferrer">
                          <img src={tx.payment_invoice_url} alt="uploaded payment proof" className="max-h-40 rounded border" />
                        </a>
                      </div>
                    )}
                    <label className="text-xs font-medium mt-2">Shipping address</label>
                    <textarea className="w-full mt-1 border rounded p-2" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Shipping address" />
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={handleUploadPayment} className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60" disabled={isUploadingPayment}>
                        {isUploadingPayment ? 'Uploading…' : 'Upload Payment'}
                      </button>
                      {isUploadingPayment && <div className="text-xs text-gray-500">Uploading payment image…</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>

          <li>
            <div className="flex items-center justify-between">
              <div>
                <strong>2. Seller confirms payment & uploads shipping invoice</strong>
                <div className="text-xs text-gray-500">Status: {tx.status === 'PendingShipping' ? 'Waiting' : (tx.status === 'PendingReceipt' ? 'Done' : '')}</div>
              </div>
              {tx.status === 'PendingShipping' && isSeller && (
                <div className="w-full mt-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium">Shipping proof (image)</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; setShippingFile(f); if (f) setShippingPreview(URL.createObjectURL(f)); }} />
                    {shippingPreview && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Preview</p>
                        <img src={shippingPreview} alt="shipping preview" className="max-h-40 rounded border" />
                      </div>
                    )}
                    {tx.shipping_invoice_url && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Uploaded shipping proof</p>
                        <a href={tx.shipping_invoice_url} target="_blank" rel="noreferrer">
                          <img src={tx.shipping_invoice_url} alt="uploaded shipping proof" className="max-h-40 rounded border" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={handleUploadShipping} className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60" disabled={isUploadingShipping}>
                        {isUploadingShipping ? 'Uploading…' : 'Confirm & Upload Shipping'}
                      </button>
                      {isUploadingShipping && <div className="text-xs text-gray-500">Uploading shipping proof…</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>

          <li>
            <div className="flex items-center justify-between">
              <div>
                <strong>3. Buyer confirms receipt</strong>
                <div className="text-xs text-gray-500">Status: {tx.status === 'PendingReceipt' ? 'Waiting' : (tx.status === 'Completed' ? 'Done' : '')}</div>
              </div>
              {tx.status === 'PendingReceipt' && isWinner && (
                <button onClick={handleConfirmReceipt} className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60" disabled={isConfirmingReceipt}>
                  {isConfirmingReceipt ? 'Confirming…' : 'Confirm Receipt'}
                </button>
              )}
            </div>
          </li>

          <li>
            <div className="flex items-center justify-between">
              <div>
                <strong>4. Rate transaction (both parties)</strong>
                <div className="text-xs text-gray-500">After completed you and the other party can rate the transaction (+/-)</div>
              </div>
                {tx.status === 'Completed' && (
                  <div className="w-full">
                    {/* If user already rated, show their rating and don't allow another vote */}
                    {myRating ? (
                      <div className="p-3 border rounded bg-gray-50">
                        <div className="text-sm font-semibold">Your rating</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`px-2 py-1 rounded ${myRating.score === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{myRating.score === 'Positive' ? '+ (Good)' : '- (Bad)'}</div>
                          {myRating.comment && <div className="text-sm text-gray-700">{myRating.comment}</div>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">You can only vote once for this transaction.</div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {!showRatingForm ? (
                          <>
                            <button onClick={() => { setShowRatingForm(true); setRatingScore('Positive'); }} className="bg-green-100 px-3 py-1 rounded">+ (Good)</button>
                            <button onClick={() => { setShowRatingForm(true); setRatingScore('Negative'); }} className="bg-red-100 px-3 py-1 rounded">- (Bad)</button>
                          </>
                        ) : (
                          <div className="p-3 border rounded bg-white w-full">
                            <div className="text-xs mb-2">Leaving a {ratingScore === 'Positive' ? 'positive' : 'negative'} rating</div>
                            <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Short comment (optional)" className="w-full p-2 border rounded mb-2" />
                            <div className="flex gap-2">
                              <button onClick={handlePostRating} className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60" disabled={isPostingRating}>{isPostingRating ? 'Posting…' : 'Submit'}</button>
                              <button onClick={() => { setShowRatingForm(false); setRatingComment(''); setRatingScore(null); }} className="px-3 py-1 border rounded">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </li>
        </ol>

        {/* Cancel for seller */}
        {isSeller && tx.status !== 'Cancelled' && tx.status !== 'Completed' && (
          <div className="mt-4">
            {!showCancelForm ? (
              <button onClick={handleCancel} className="text-red-600 border border-red-200 px-3 py-1 rounded disabled:opacity-60" disabled={isCancelling}>
                {isCancelling ? 'Cancelling…' : 'Cancel Transaction'}
              </button>
            ) : (
              <div className="mt-3 space-y-2 bg-red-50 border border-red-100 p-3 rounded">
                <p className="text-sm text-red-700 font-semibold">Confirm cancel</p>
                <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" className="w-full p-2 border rounded" />
                <div className="flex gap-2">
                  <button onClick={handleConfirmCancel} className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60" disabled={isCancelling}>{isCancelling ? 'Cancelling…' : 'Confirm Cancel'}</button>
                  <button onClick={() => { setShowCancelForm(false); setCancelReason(''); }} className="px-3 py-1 border rounded">Back</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white p-4 border rounded-lg shadow-sm">
        <h4 className="font-semibold mb-2">Chat</h4>
        <div className="max-h-52 overflow-y-auto p-2 border rounded bg-gray-50">
          {messages?.length === 0 && <div className="text-xs text-gray-400">No messages yet</div>}
          {messages?.map((m) => (
            <div key={m.id} className={`p-2 my-1 rounded ${m.sender_id === user?.id ? 'bg-primary/10 self-end' : 'bg-white'}`}>
              <div className="text-xs text-gray-500">{m.created_at}</div>
              <div className="text-sm">{m.message}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1 border rounded p-2" />
          <button onClick={handleSendMessage} className="bg-primary text-white px-3 py-1 rounded disabled:opacity-60" disabled={isSendingMessage}>
            {isSendingMessage ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
