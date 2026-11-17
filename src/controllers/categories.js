import {
  getAllCategories,
  getCategoryDetails,
  getCategoriesByProjectId,
  updateCategoryAssignments,
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

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
};
