const prisma = require("../config/prisma");

// Lấy tất cả category IDs (bao gồm parent và tất cả children)
const getAllCategoryIds = async (categoryId) => {
  try {
    const categoryIdNum = Number(categoryId);

    // Kiểm tra category có tồn tại không
    const category = await prisma.category.findUnique({
      where: { id: categoryIdNum },
    });

    if (!category) {
      return [categoryIdNum];
    }

    // Query tất cả children categories có parent_id = categoryId
    const childrenCategories = await prisma.category.findMany({
      where: { parent_id: categoryIdNum },
      select: { id: true },
    });

    // Lấy tất cả children IDs
    const childrenIds = childrenCategories.map((child) => child.id);

    // Trả về parent ID + tất cả children IDs
    return [categoryIdNum, ...childrenIds];
  } catch (error) {
    console.error("Error in getAllCategoryIds:", error);
    // Nếu có lỗi, trả về chỉ categoryId
    return [Number(categoryId)];
  }
};

// Lấy tất cả categories với children
const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
    });
    return categories;
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    throw error;
  }
};

// Lấy category theo ID với children
const getCategoryById = async (id) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { children: true },
    });
    return category;
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    throw error;
  }
};

// Tạo category mới
const createCategory = async (data) => {
  try {
    const { name, description, parentId } = data;

    // Kiểm tra category đã tồn tại chưa
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw new Error("Category name already exists");
    }

    const newCategory = await prisma.category.create({
      data: { name, description, parent_id: parentId || null },
    });

    return newCategory;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

// Cập nhật category
const updateCategory = async (id, data) => {
  try {
    const { name, description, parentId } = data;

    // Kiểm tra category có tồn tại không
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Kiểm tra tên mới có trùng không (nếu có thay đổi)
    if (name && name !== category.name) {
      const exists = await prisma.category.findUnique({ where: { name } });
      if (exists) {
        throw new Error("Category name already exists");
      }
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: name || category.name,
        description: description ?? category.description,
        parent_id: parentId ?? category.parent_id,
      },
    });

    return updated;
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error;
  }
};

// Xóa category
const deleteCategory = async (id) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    return { message: "Category deleted" };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    if (error.code === "P2003") {
      throw new Error("Cannot delete category with products or children");
    }
    throw error;
  }
};

module.exports = {
  getAllCategoryIds,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
