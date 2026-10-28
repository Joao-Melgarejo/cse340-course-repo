import db from './db.js';

const getAllOrganizations = async () => {
    const result = await db.query(`
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        ORDER BY organization_id;
    `);
    return result.rows;
};

export { getAllOrganizations };
