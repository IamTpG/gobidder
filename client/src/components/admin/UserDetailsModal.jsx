import React from "react";
import { X, Calendar, MapPin, Mail, User, Clock, Shield } from "lucide-react";
import Modal from "../common/Modal";

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {user.full_name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.role === "Admin"
                  ? "bg-purple-100 text-purple-800"
                  : user.role === "Seller"
                    ? "bg-blue-100 text-blue-800"
                    : user.role === "Banned"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Mail size={16} />
              Email
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Shield size={16} />
              Role
            </label>
            <p className="text-gray-900">{user.role}</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <MapPin size={16} />
              Address
            </label>
            <p className="text-gray-900">{user.address || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar size={16} />
              Birthdate
            </label>
            <p className="text-gray-900">
              {user.birthdate
                ? new Date(user.birthdate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Clock size={16} />
              Joined
            </label>
            <p className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
