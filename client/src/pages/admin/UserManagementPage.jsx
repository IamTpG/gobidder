import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Users,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  Ban,
  Filter,
} from "lucide-react";
import ReactPaginate from "react-paginate";

import Spinner from "../../components/common/Spinner";
import UserForm from "../../components/admin/UserForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import toast from "react-hot-toast";
import api from "../../services/api";
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    const response = await api.post("/users", formData);
    toast.success("User created successfully");
    fetchUsers();
  };

  const handleUpdateUser = async (formData) => {
    const response = await api.put(`/users/${selectedUser.id}`, formData);
    toast.success("User updated successfully");
    fetchUsers();
  };

  // Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const openDeleteConfirm = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setUserToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success("User has been banned/deleted");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to ban/delete user");
    } finally {
      closeDeleteConfirm();
    }
  };

  const handleRestoreUser = async (userId) => {
    toast.error("Please use Edit to change role back from Banned.");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentUsers = filteredUsers.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Seller":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Bidder":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ExpiredSeller":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Banned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Helmet>
        <title>User Management - GoBidder Admin</title>
      </Helmet>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold dark:text-white">
            <Users className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-500 dark:text-gray-400" size={20} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Roles</option>
            <option value="Bidder">Bidder</option>
            <option value="Seller">Seller</option>
            <option value="Admin">Admin</option>
            <option value="ExpiredSeller">ExpiredSeller</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibol leading-5 ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          {user.role !== "Banned" && (
                            <button
                              onClick={() => openDeleteConfirm(user)}
                              className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                              title="Ban User"
                            >
                              <Ban size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"flex justify-center items-center gap-2 mt-6"}
          pageClassName={
            "rounded-md border border-gray-300 dark:border-gray-600"
          }
          pageLinkClassName={
            "block px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          }
          activeClassName={"bg-blue-600 border-blue-600 text-white"}
          activeLinkClassName={"bg-blue-600 text-white hover:bg-blue-700"}
          previousClassName={
            "rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          }
          nextClassName={
            "rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          }
          disabledClassName={"opacity-50 cursor-not-allowed"}
        />
      )}

      {isModalOpen && (
        <UserForm
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={selectedUser ? handleUpdateUser : handleCreateUser}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirm Ban/Delete"
        message={`Are you sure you want to ban/delete user "${userToDelete?.full_name}"? This action will set their role to 'Banned'.`}
        confirmText="Ban User"
        confirmVariant="danger"
      />
    </div>
  );
};

export default UserManagementPage;
