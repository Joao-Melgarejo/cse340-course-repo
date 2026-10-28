import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import db, { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';

// Read configuration supplied by the local .env file or hosting service.
const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'production';
const port = process.env.PORT || 3000;
const currentFilename = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilename);
const app = express();

// Resolve paths from this file so they also work from another working directory.
app.use(express.static(path.join(currentDirectory, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(currentDirectory, 'src/views'));

app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
    const title = 'Our Partner Organizations';
    const organizations = await getAllOrganizations();
    res.render('organizations', { title, organizations });
});

app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    const projects = await getAllProjects();
    res.render('projects', { title, projects });
});

app.get('/categories', async (req, res) => {
    const title = 'Service Project Categories';
    res.render('categories', { title });
});

// Express 5 forwards rejected async route handlers to this middleware.
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error('Request failed:', error.code || 'UNKNOWN');
    res.status(500).render('error', { title: 'Service Unavailable' });
});

// Verify the database before accepting requests; a failed connection exits clearly.
try {
    await testConnection();
    app.listen(port, () => {
        console.log(`Server is running at http://127.0.0.1:${port}`);
        console.log(`Environment: ${nodeEnv}`);
    });
} catch {
    console.error('Startup failed. Check DB_URL, SSL settings and database availability.');
    await db.close();
    process.exitCode = 1;
}
