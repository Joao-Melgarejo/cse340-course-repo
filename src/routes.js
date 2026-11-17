import express from "express";
import { showHomePage } from "./controllers/index.js";
import {
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
  organizationValidation,
  logoValidation,
} from "./controllers/organizations.js";
import {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  showEditProjectForm,
  processEditProjectForm,
  projectValidation,
} from "./controllers/projects.js";
import {
  showCategoriesPage,
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
} from "./controllers/categories.js";
import { testErrorPage } from "./controllers/errors.js";
import { validateId } from "./middleware/validate-id.js";

const router = express.Router();

router.get("/", showHomePage);
router.get("/organizations", showOrganizationsPage);
router.get("/organization/:id", validateId, showOrganizationDetailsPage);
router.get("/projects", showProjectsPage);
router.get("/project/:id", validateId, showProjectDetailsPage);
router.get("/categories", showCategoriesPage);
router.get("/category/:id", validateId, showCategoryDetailsPage);
router.get("/new-organization", showNewOrganizationForm);
router.post(
  "/new-organization",
  organizationValidation,
  processNewOrganizationForm,
);
router.get("/edit-organization/:id", validateId, showEditOrganizationForm);
router.post(
  "/edit-organization/:id",
  validateId,
  organizationValidation,
  logoValidation,
  processEditOrganizationForm,
);
router.get("/new-project", showNewProjectForm);
router.post("/new-project", projectValidation, processNewProjectForm);
router.get("/edit-project/:id", validateId, showEditProjectForm);
router.post(
  "/edit-project/:id",
  validateId,
  projectValidation,
  processEditProjectForm,
);
router.get(
  "/assign-categories/:projectId",
  validateId,
  showAssignCategoriesForm,
);
router.post(
  "/assign-categories/:projectId",
  validateId,
  processAssignCategoriesForm,
);
router.get("/test-error", testErrorPage);

export default router;
