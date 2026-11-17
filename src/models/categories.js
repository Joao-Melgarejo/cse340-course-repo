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

const assignCategoryToProject = async (projectId, categoryId, client) => {
  await client.query(
    `
        INSERT INTO public.project_category (project_id, category_id)
        VALUES ($1, $2);
    `,
    [projectId, categoryId],
  );
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
  const ids = [...new Set(categoryIds.map(Number))];
  // BEGIN, DELETE, INSERT and COMMIT must share the same connection.
  await db.transaction(async (client) => {
    // Serialize edits of this project's category assignments.
    const project = await client.query(
      "SELECT project_id FROM public.project WHERE project_id = $1 FOR UPDATE;",
      [projectId],
    );
    if (!project.rows.length) {
      const error = new Error("Service project not found");
      error.status = 404;
      throw error;
    }
    await client.query(
      "DELETE FROM public.project_category WHERE project_id = $1;",
      [projectId],
    );
    for (const categoryId of ids) {
      await assignCategoryToProject(projectId, categoryId, client);
    }
  });
};

export {
  getAllCategories,
  getCategoryDetails,
  getCategoriesByProjectId,
  updateCategoryAssignments,
};
