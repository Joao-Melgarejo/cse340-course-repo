import db from "./db.js";

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

const getProjectsByOrganizationId = async (organizationId) => {
  const result = await db.query(
    `
        SELECT project_id, organization_id, title, description, location,
               TO_CHAR(date, 'YYYY-MM-DD') AS date
        FROM public.project
        WHERE organization_id = $1
        ORDER BY date, project_id;
    `,
    [organizationId],
  );
  return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
  if (
    !Number.isInteger(numberOfProjects) ||
    numberOfProjects < 1 ||
    numberOfProjects > 2147483647
  ) {
    throw new RangeError(
      "The number of upcoming projects must be a positive PostgreSQL integer.",
    );
  }
  const result = await db.query(
    `
        SELECT p.project_id, p.organization_id, p.title, p.description, p.location,
               TO_CHAR(p.date, 'YYYY-MM-DD') AS date,
               o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date, p.project_id
        LIMIT $1;
    `,
    [numberOfProjects],
  );
  return result.rows;
};

const getProjectDetails = async (id) => {
  const result = await db.query(
    `
        SELECT p.project_id, p.organization_id, p.title, p.description, p.location,
               TO_CHAR(p.date, 'YYYY-MM-DD') AS date,
               o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `,
    [id],
  );
  return result.rows[0] ?? null;
};

export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  getProjectDetails,
};
