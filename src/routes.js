import express from 'express';
import { showHomePage } from './controllers/index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { showCategoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';
import { validateId } from './middleware/validate-id.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', validateId, showOrganizationDetailsPage);
router.get('/projects', showProjectsPage);
router.get('/project/:id', validateId, showProjectDetailsPage);
router.get('/categories', showCategoriesPage);
router.get('/test-error', testErrorPage);

export default router;
