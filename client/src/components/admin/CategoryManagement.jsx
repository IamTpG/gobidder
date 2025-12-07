import React, { useState } from "react";
import { Modal, Button, ConfirmDialog } from "../common";
import api from "../../services/api";

const CategoryManagement = ({
  categories,
  allCategories: allCategoriesProp,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Error cho delete (hiển thị ngoài)
  const [modalError, setModalError] = useState(null); // Error cho create/update (hiển thị trong modal)
  const [success, setSuccess] = useState(null);

  // Flatten categories để hiển thị (bao gồm cả parent và children)
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  // Sử dụng allCategoriesProp nếu có, nếu không thì flatten từ categories
  const displayCategories = allCategoriesProp
    ? flattenCategories(
        allCategoriesProp.filter((cat) => !cat.parent_id),
        0,
      )
    : flattenCategories(categories, 0);

  const parentCategories = categories.filter((cat) => !cat.parent_id);

  const handleOpenModal = (category = null) => {
    if (category) {
      // Tìm category đầy đủ từ allCategoriesProp để có thông tin children
      const fullCategory = allCategoriesProp
        ? allCategoriesProp.find((c) => c.id === category.id)
        : category;

      setEditingCategory(fullCategory || category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        parentId: category.parent_id || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        parentId: "",
      });
    }
    setIsModalOpen(true);
    setModalError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", parentId: "" });
    setModalError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError(null);
    setSuccess(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
      };

      if (editingCategory) {
        // Update
        await api.patch(`/categories/${editingCategory.id}`, payload);
      } else {
        // Create
        await api.post("/categories", payload);
      }

      // Chỉ đóng modal khi thành công
      handleCloseModal();

      // Refresh categories sau khi đóng modal
      if (onUpdate) {
        await onUpdate();
      }

      setLoading(false);
    } catch (err) {
      // Khi có lỗi, không đóng modal và hiển thị lỗi trong modal
      setModalError(err.response?.data?.message || "Failed to save category");
      setLoading(false);
    }
  };

  const handleDeleteClick = (categoryId, categoryName) => {
    setDeleteDialog({
      isOpen: true,
      categoryId,
      categoryName,
    });
  };

  const handleDeleteConfirm = async () => {
    const { categoryId } = deleteDialog;
    setLoading(true);
    try {
      await api.delete(`/categories/${categoryId}`);
      setSuccess("Category deleted successfully!");
      if (onUpdate) {
        await onUpdate();
      }
      setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, categoryId: null, categoryName: "" });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 py-2">
        <div className="flex items-center justify-end mb-6">
          <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
            + Add Category
          </Button>
        </div>

        {/* Error chỉ hiển thị cho delete, không hiển thị cho create/update */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-sm">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Parent</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                displayCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {category.level > 0 && (
                          <span className="text-gray-400">
                            {"└".repeat(category.level)}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {category.description || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {category.parent_id
                          ? (allCategoriesProp || displayCategories).find(
                              (c) => c.id === category.parent_id,
                            )?.name || "-"
                          : "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            // Tìm category đầy đủ với children từ allCategoriesProp hoặc categories
                            const fullCategory = allCategoriesProp
                              ? allCategoriesProp.find(
                                  (c) => c.id === category.id,
                                )
                              : categories.find((c) => c.id === category.id) ||
                                displayCategories.find(
                                  (c) => c.id === category.id,
                                );
                            handleOpenModal(fullCategory || category);
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(category.id, category.name)
                          }
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Create New Category"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hiển thị lỗi trong modal */}
          {modalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              rows="3"
              placeholder="Enter category description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
              {editingCategory &&
                editingCategory.children &&
                editingCategory.children.length > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    (This category has children, can only be set to Top Level)
                  </span>
                )}
            </label>
            <select
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              disabled={
                editingCategory &&
                editingCategory.children &&
                editingCategory.children.length > 0
              }
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none ${
                editingCategory &&
                editingCategory.children &&
                editingCategory.children.length > 0
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              {editingCategory && editingCategory.parent_id ? (
                // Nếu là category con, không hiển thị "None (Top Level)"
                parentCategories
                  .filter(
                    (cat) => !editingCategory || cat.id !== editingCategory.id,
                  )
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
              ) : (
                <>
                  <option value="">None (Top Level)</option>
                  {editingCategory &&
                  editingCategory.children &&
                  editingCategory.children.length > 0 ? (
                    // Nếu có children, chỉ hiển thị "None (Top Level)"
                    <></>
                  ) : (
                    // Nếu không có children, hiển thị tất cả parent categories (trừ chính nó)
                    parentCategories
                      .filter(
                        (cat) =>
                          !editingCategory || cat.id !== editingCategory.id,
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                  )}
                </>
              )}
            </select>
            {editingCategory &&
              editingCategory.children &&
              editingCategory.children.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  This category has {editingCategory.children.length} child
                  {editingCategory.children.length > 1 ? "ren" : ""}. You can
                  only set it to Top Level.
                </p>
              )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={loading}
      />
    </>
  );
};

export default CategoryManagement;
