import React from "react";

import ProfileAvatar from "./ProfileAvatar";
import ProfileInfoCard from "./ProfileInfoCard";
import RatingDisplay from "./RatingDisplay";

const formatDisplayDate = (value) => {
  if (!value) return "Update your information";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Update your information";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ProfileViewMode = ({ profile, onEdit }) => {
  const birthdateDisplay = formatDisplayDate(profile?.birthdate);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-6">
          <ProfileAvatar name={profile.full_name} />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile.full_name}
            </h2>
            <p className="text-gray-500">{profile.email}</p>
            <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {profile.role}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="self-start md:self-center px-5 py-2 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition"
        >
          Edit
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfoCard label="Full name" value={profile.full_name} />
        <ProfileInfoCard label="Email" value={profile.email} />
        <ProfileInfoCard label="Address" value={profile.address} />
        <ProfileInfoCard label="Birthdate" value={birthdateDisplay} />
        {profile.rating && <RatingDisplay rating={profile.rating} />}
      </div>
    </div>
  );
};

export default ProfileViewMode;
