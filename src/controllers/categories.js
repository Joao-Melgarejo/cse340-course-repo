import { body, validationResult } from "express-validator";
import {
  getAllCategories,
  getCategoryDetails,
  getCategoriesByProjectId,
  updateCategoryAssignments,
  createCategory,
  updateCategory,
} from "../models/categories.js";
import {
  getProjectDetails,
  getProjectsByCategoryId,
} from "../models/projects.js";

const showCategoriesPage = async (req, res) => {
  const categories = await getAllCategories();
  res.render("categories", { title: "Service Project Categories", categories });
};

const showCategoryDetailsPage = async (req, res, next) => {
  const id = Number(req.params.id);
  const category = await getCategoryDetails(id);
  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    return next(error);
  }
  const projects = await getProjectsByCategoryId(id);
  res.render("category", { title: category.name, category, projects });
};

const showAssignCategoriesForm = async (req, res) => {
  const projectId = Number(req.params.projectId);
  const projectDetails = await getProjectDetails(projectId);
  if (!projectDetails) {
    const error = new Error("Service project not found");
    error.status = 404;
    throw error;
  }
  const categories = await getAllCategories();
  const assignedCategories = await getCategoriesByProjectId(projectId);
  res.render("assign-categories", {
    title: "Assign Categories to Project",
    projectId,
    projectDetails,
    categories,
    assignedCategories,
  });
};

const processAssignCategoriesForm = async (req, res) => {
  const projectId = Number(req.params.projectId);
  if (!(await getProjectDetails(projectId))) {
    const error = new Error("Service project not found");
    error.status = 404;
    throw error;
  }
  // No checkboxes means clear all assignments; a single checked box is a string.
  const selected = req.body?.categoryIds ?? [];
  const categoryIds = Array.isArray(selected) ? selected : [selected];
  const categories = await getAllCategories();
  const validIds = new Set(
    categories.map((category) => String(category.category_id)),
  );
  if (categoryIds.some((id) => typeof id !== "string" || !validIds.has(id))) {
    req.flash("error", "Select only categories that exist in the list.");
    return res.redirect(303, `/assign-categories/${projectId}`);
  }
  await updateCategoryAssignments(projectId, categoryIds);
  req.flash("success", "Categories updated successfully.");
  res.redirect(303, `/project/${projectId}`);
};

const categoryValidation = [
  body("name")
    .isString()
    .withMessage("Category name is required.")
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Category name must contain 3 to 100 characters."),
];

const showNewCategoryForm = async (req, res) => {
  res.render("new-category", { title: "Add New Category", name: "" });
};

const showEditCategoryForm = async (req, res) => {
  const category = await getCategoryDetails(Number(req.params.id));
  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }
  res.render("edit-category", { title: "Edit Category", category });
};

// Re-render invalid submissions so the user can correct the entered name.
const processNewCategoryForm = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res
      .status(400)
      .render("new-category", { title: "Add New Category", name });
  }
  let id;
  try {
    id = await createCategory(name);
  } catch (error) {
    // The database UNIQUE constraint also protects concurrent submissions.
    if (error.code !== "23505") throw error;
    req.flash("error", "A category with this name already exists.");
    return res
      .status(400)
      .render("new-category", { title: "Add New Category", name });
  }
  req.flash("success", "Category added successfully!");
  res.redirect(303, `/category/${id}`);
};

const processEditCategoryForm = async (req, res) => {
  const id = Number(req.params.id);
  const category = await getCategoryDetails(id);
  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }
  const name = typeof req.body?.name === "string" ? req.body.name : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res
      .status(400)
      .render("edit-category", {
        title: "Edit Category",
        category: { ...category, name },
      });
  }
  let updatedId;
  try {
    updatedId = await updateCategory(id, name);
  } catch (error) {
    if (error.code !== "23505") throw error;
    req.flash("error", "A category with this name already exists.");
    return res
      .status(400)
      .render("edit-category", {
        title: "Edit Category",
        category: { ...category, name },
      });
  }
  if (!updatedId) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }
  req.flash("success", "Category updated successfully!");
  res.redirect(303, `/category/${id}`);
};

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  categoryValidation,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
};
