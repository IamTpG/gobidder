import React from "react";
import { useParams } from "react-router-dom";
import RatingsTab from "../components/profile/RatingsTab";

const UserRatingsPage = () => {
  const { userId } = useParams();

  return <RatingsTab userId={userId} standalone={true} />;
};

export default UserRatingsPage;
