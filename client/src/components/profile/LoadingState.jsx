import React from "react";

import Spinner from "../common/Spinner";

const LoadingState = ({ message = "Loading user information..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Spinner size="lg" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
