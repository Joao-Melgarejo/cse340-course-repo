import { body, validationResult } from "express-validator";
import {
  getAllOrganizations,
  getOrganizationDetails,
  createOrganization,
  updateOrganization,
} from "../models/organizations.js";
import { getProjectsByOrganizationId } from "../models/projects.js";

const showOrganizationsPage = async (req, res) => {
  const organizations = await getAllOrganizations();
  res.render("organizations", {
    title: "Our Partner Organizations",
    organizations,
  });
};

const showOrganizationDetailsPage = async (req, res, next) => {
  const organizationId = Number(req.params.id);
  const organizationDetails = await getOrganizationDetails(organizationId);
  if (!organizationDetails) {
    const error = new Error("Organization not found");
    error.status = 404;
    return next(error);
  }
  const projects = await getProjectsByOrganizationId(organizationId);
  res.render("organization", {
    title: "Organization Details",
    organizationDetails,
    projects,
  });
};

// Store canonical text; EJS <%= ... %> escapes it whenever it enters HTML.
const organizationValidation = [
  body("name")
    .isString()
    .withMessage("Organization name is required")
    .bail()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Organization name must be between 3 and 150 characters"),
  body("description")
    .isString()
    .withMessage("Description is required")
    .bail()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description must contain 1 to 500 characters"),
  body("contactEmail")
    .isString()
    .withMessage("Contact email is required")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Email cannot exceed 255 characters")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .bail()
    .normalizeEmail(),
];

const logoValidation = body("logoFilename")
  .isString()
  .withMessage("Logo filename is required")
  .bail()
  .trim()
  .isLength({ min: 1, max: 255 })
  .withMessage("Logo filename is required (maximum 255 characters)")
  .matches(/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|gif)$/i)
  .withMessage(
    "Use an image filename from public/images, without a directory or URL",
  );

const showNewOrganizationForm = async (req, res) => {
  res.render("new-organization", { title: "Add New Organization" });
};

const processNewOrganizationForm = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res.redirect(303, "/new-organization");
  }
  const { name, description, contactEmail } = req.body;
  const id = await createOrganization(
    name,
    description,
    contactEmail,
    "placeholder-logo.png",
  );
  req.flash("success", "Organization added successfully!");
  res.redirect(303, `/organization/${id}`);
};

const showEditOrganizationForm = async (req, res) => {
  const organizationDetails = await getOrganizationDetails(
    Number(req.params.id),
  );
  if (!organizationDetails) {
    const error = new Error("Organization not found");
    error.status = 404;
    throw error;
  }
  res.render("edit-organization", {
    title: "Edit Organization",
    organizationDetails,
  });
};

const processEditOrganizationForm = async (req, res) => {
  const id = Number(req.params.id);
  if (!(await getOrganizationDetails(id))) {
    const error = new Error("Organization not found");
    error.status = 404;
    throw error;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => req.flash("error", error.msg));
    return res.redirect(303, `/edit-organization/${id}`);
  }
  const { name, description, contactEmail, logoFilename } = req.body;
  await updateOrganization(id, name, description, contactEmail, logoFilename);
  req.flash("success", "Organization updated successfully!");
  res.redirect(303, `/organization/${id}`);
};

export {
  showOrganizationsPage,
  showOrganizationDetailsPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  showEditOrganizationForm,
  processEditOrganizationForm,
  organizationValidation,
  logoValidation,
};
