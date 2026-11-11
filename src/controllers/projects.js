import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res) => {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    res.render('projects', { title: 'Upcoming Service Projects', projects });
};

const showProjectDetailsPage = async (req, res, next) => {
    const project = await getProjectDetails(Number(req.params.id));
    if (!project) {
        const error = new Error('Service project not found');
        error.status = 404;
        return next(error);
    }
    res.render('project', { title: project.title, project });
};

export { showProjectsPage, showProjectDetailsPage };
