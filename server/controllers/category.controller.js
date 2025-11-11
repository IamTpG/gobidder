const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { children: true } });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { children: true },
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createCategory = async (req, res) => {
  const { name, description, parentId } = req.body;
  if (!name || name.trim() === "") return res.status(400).json({ message: "Name is required" });

  try {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ message: "Category name already exists" });

    const newCategory = await prisma.category.create({
      data: { name, description, parent_id: parentId || null },
    });

    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;

  try {
    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name && name !== category.name) {
      const exists = await prisma.category.findUnique({ where: { name } });
      if (exists) return res.status(400).json({ message: "Category name already exists" });
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: name || category.name,
        description: description ?? category.description,
        parent_id: parentId ?? category.parent_id,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    if (err.code === "P2003") {
      return res.status(400).json({ message: "Cannot delete category with products or children" });
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
