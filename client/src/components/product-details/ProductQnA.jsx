import React, { useState } from "react";

import { formatDateTime } from "../../utils/formatters";

const ProductQnA = ({
  product,
  user,
  onSubmitQuestion,
  onSubmitAnswer,
  isSubmittingMap,
}) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [answerText, setAnswerText] = useState({});

  const isSeller = user && product.seller && user.id === product.seller.id;

  const handleSendAnswer = (qId) => {
    if (answerText[qId]) {
      onSubmitAnswer(qId, answerText[qId]);
      setAnswerText((prev) => ({ ...prev, [qId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">
        Questions & Answers ({product.qnaItems?.length || 0})
      </h3>

      {/* List QnA */}
      <div className="space-y-4">
        {product.qnaItems?.map((qna) => (
          <div
            key={qna.id}
            id={`q-${qna.id}`}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="mb-2">
              <span className="font-semibold text-gray-900 mr-2">Q:</span>
              <span className="text-gray-800">{qna.questionText}</span>
              <div className="text-xs text-gray-500 mt-1">
                by {qna.questioner?.fullName || "Anonymous"} -{" "}
                {formatDateTime(qna.questionTime)}
              </div>
            </div>

            {/* Answer Section */}
            {qna.answerText ? (
              <div className="mt-3 pl-4 border-l-2 border-primary">
                <span className="font-semibold text-primary mr-2">A:</span>
                <span className="text-gray-700">{qna.answerText}</span>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDateTime(qna.answerTime)}
                </div>
              </div>
            ) : isSeller ? (
              <div className="mt-3 pl-4 border-l-2 border-gray-300">
                <textarea
                  className="w-full text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
                  placeholder="Answer this question..."
                  rows={2}
                  value={answerText[qna.id] || ""}
                  onChange={(e) =>
                    setAnswerText({ ...answerText, [qna.id]: e.target.value })
                  }
                />
                <button
                  onClick={() => handleSendAnswer(qna.id)}
                  disabled={isSubmittingMap[qna.id]}
                  className="mt-2 text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90"
                >
                  {isSubmittingMap[qna.id] ? "Sending..." : "Reply"}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400 italic pl-4">
                Waiting for seller response...
              </p>
            )}
          </div>
        ))}
        {(!product.qnaItems || product.qnaItems.length === 0) && (
          <p className="text-center text-gray-500 py-4">No questions yet.</p>
        )}
      </div>

      {/* Ask Question Form (Hide for Seller) */}
      {!isSeller && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">Ask a Question</h4>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            disabled={!user}
            placeholder={
              user ? "Type your question..." : "Please login to ask question"
            }
            className="w-full p-2 border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            rows={3}
          />
          <button
            onClick={() => {
              if (newQuestion.trim()) {
                onSubmitQuestion(newQuestion);
                setNewQuestion("");
              }
            }}
            disabled={!user || !newQuestion.trim()}
            className="mt-3 w-full sm:w-auto bg-primary text-white font-medium py-2 px-6 rounded-lg hover:bg-primary/90 disabled:bg-gray-300 transition-colors"
          >
            Submit Question
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductQnA;
