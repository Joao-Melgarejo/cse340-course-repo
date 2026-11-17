import { body, validationResult } from "express-validator";
import {
  getAllOrganizations,
  getOrganizationDetails,
} from "../models/organizations.js";
import {
  getUpcomingProjects,
  getProjectDetails,
  createProject,
  updateProject,
} from "../models/projects.js";
import { getCategoriesByProjectId } from "../models/categories.js";

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res) => {
  const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
  res.render("projects", { title: "Upcoming Service Projects", projects });
};

const showProjectDetailsPage = async (req, res, next) => {
  const project = await getProjectDetails(Number(req.params.id));
  if (!project) {
    const error = new Error("Service project not found");
    error.status = 404;
    return next(error);
  }
  const categories = await getCategoriesByProjectId(project.project_id);
  res.render("project", { title: project.title, project, categories });
};

const projectValidation = [
  // The existing database column is VARCHAR(150), even though one PDF example says 200.
  body("title")
    .isString()
    .withMessage("Title is required")
    .bail()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .isString()
    .withMessage("Description is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Description must contain 1 to 1000 characters"),
  body("location")
    .isString()
    .withMessage("Location is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Location must contain 1 to 200 characters"),
  body("date")
    .isString()
    .withMessage("Date is required")
    .bail()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Use a date in YYYY-MM-DD format")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Date must be a valid calendar date"),
  body("organizationId")
    .isString()
    .withMessage("Organization is required")
    .bail()
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Select a valid organization")
    .bail()
    .custom(async (value) => {
      if (!(await getOrganizationDetails(Number(value))))
        throw new Error("Selected organization does not exist");
      return true;
    }),
];

const showNewProjectForm = async (req, res) => {
  const organizations = await getAllOrganizations();
  res.render("new-project", {
    title: "Add New Service Project",
    organizations,
  });
};

const processNewProjectForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res.redirect(303, "/new-project");
  }
  const { title, description, location, date, organizationId } = req.body;
  const id = await createProject(
    title,
    description,
    location,
    date,
    Number(organizationId),
  );
  req.flash("success", "New service project created successfully!");
  res.redirect(303, `/project/${id}`);
};

const showEditProjectForm = async (req, res) => {
  const project = await getProjectDetails(Number(req.params.id));
  if (!project) {
    const error = new Error("Service project not found");
    error.status = 404;
    throw error;
  }
  const organizations = await getAllOrganizations();
  res.render("edit-project", {
    title: "Edit Service Project",
    project,
    organizations,
  });
};

const processEditProjectForm = async (req, res) => {
  const id = Number(req.params.id);
  if (!(await getProjectDetails(id))) {
    const error = new Error("Service project not found");
    error.status = 404;
    throw error;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res.redirect(303, `/edit-project/${id}`);
  }
  const { title, description, location, date, organizationId } = req.body;
  await updateProject(
    id,
    title,
    description,
    location,
    date,
    Number(organizationId),
  );
  req.flash("success", "Service project updated successfully!");
  res.redirect(303, `/project/${id}`);
};

export {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation,
};
