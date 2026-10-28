import db from './db.js';

const getAllProjects = async () => {
    const result = await db.query(`
        SELECT p.project_id, p.organization_id, p.title, p.description, p.location,
               TO_CHAR(p.date, 'YYYY-MM-DD') AS date,
               o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o ON p.organization_id = o.organization_id
        ORDER BY p.date, p.project_id;
    `);
    return result.rows;
};

export { getAllProjects };
