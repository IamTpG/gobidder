const categoryService = require("../services/category.service");

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createCategory = async (req, res) => {
  const { name, description, parentId } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const newCategory = await categoryService.createCategory({
      name,
      description,
      parentId,
    });
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    if (err.message === "Category name already exists") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;

  try {
    const updated = await categoryService.updateCategory(id, {
      name,
      description,
      parentId,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.message === "Category not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Category name already exists") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await categoryService.deleteCategory(id);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Cannot delete category with products or children") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
