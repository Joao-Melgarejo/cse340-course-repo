import db from "./db.js";

const getAllCategories = async () => {
  const result = await db.query(`
        SELECT category_id, name
        FROM public.category
        ORDER BY name, category_id;
    `);
  return result.rows;
};

const getCategoryDetails = async (id) => {
  const result = await db.query(
    `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `,
    [id],
  );
  return result.rows[0] ?? null;
};

const getCategoriesByProjectId = async (projectId) => {
  const result = await db.query(
    `
        SELECT c.category_id, c.name
        FROM public.category AS c
        JOIN public.project_category AS pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name, c.category_id;
    `,
    [projectId],
  );
  return result.rows;
};

export { getAllCategories, getCategoryDetails, getCategoriesByProjectId };
