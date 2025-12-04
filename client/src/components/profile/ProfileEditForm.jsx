import React from "react";

import ProfileAvatar from "./ProfileAvatar";
import FormInput from "./FormInput";
import Spinner from "../common/Spinner";

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const ProfileEditForm = ({
  profile,
  formData,
  errors,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <ProfileAvatar name={formData.full_name || profile?.full_name} />
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Update profile
          </h2>
          <p className="text-gray-500">Edit your personal information.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormInput
          label="Full name"
          name="full_name"
          value={formData.full_name}
          onChange={onChange}
          placeholder="Nguyễn Văn A"
          error={errors.full_name}
          required
        />
        <FormInput label="Email" type="email" value={profile.email} disabled />
        <FormInput
          label="Address"
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Số nhà, đường, quận, thành phố"
        />
        <FormInput
          label="Birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={onChange}
          error={errors.birthdate}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition disabled:opacity-60"
        >
          {saving ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            "Save changes"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export { toInputDate };
export default ProfileEditForm;
