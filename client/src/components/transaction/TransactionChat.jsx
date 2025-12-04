import React, { useState } from "react";

import { sendTransactionMessage } from "../../services/api";

const TransactionChat = ({ tx, messages, currentUser, onRefresh }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      setSending(true);
      const receiver =
        currentUser.id === tx.seller_id ? tx.winner_id : tx.seller_id;
      await sendTransactionMessage(tx.id, {
        receiverId: receiver,
        message: text,
      });
      setText("");
      onRefresh(); // Refresh để lấy tin nhắn mới
    } catch (err) {
      console.error("Failed to send", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      <h4 className="font-semibold mb-3 text-gray-900 border-b pb-2">Chat</h4>

      <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px] p-2 bg-gray-50 rounded mb-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            No messages yet.
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.sender_id === currentUser?.id;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${isMe ? "bg-primary text-white" : "bg-white border"}`}
              >
                <p>{m.message}</p>
                <p
                  className={`text-[10px] mt-1 ${isMe ? "text-primary-100" : "text-gray-400"}`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TransactionChat;
