import { getAllCategories, getCategoryDetails } from "../models/categories.js";
import { getProjectsByCategoryId } from "../models/projects.js";

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

export { showCategoriesPage, showCategoryDetailsPage };
