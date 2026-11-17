import db from "./db.js";

const getAllOrganizations = async () => {
  const result = await db.query(`
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        ORDER BY organization_id;
    `);
  return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
  const result = await db.query(
    `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `,
    [organizationId],
  );
  return result.rows[0] ?? null;
};

const createOrganization = async (
  name,
  description,
  contactEmail,
  logoFilename,
) => {
  const result = await db.query(
    `
        INSERT INTO public.organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4) RETURNING organization_id;
    `,
    [name, description, contactEmail, logoFilename],
  );
  if (!result.rows.length) throw new Error("Failed to create organization");
  return result.rows[0].organization_id;
};

const updateOrganization = async (
  id,
  name,
  description,
  contactEmail,
  logoFilename,
) => {
  const result = await db.query(
    `
        UPDATE public.organization
        SET name = $1, description = $2, contact_email = $3, logo_filename = $4
        WHERE organization_id = $5 RETURNING organization_id;
    `,
    [name, description, contactEmail, logoFilename, id],
  );
  if (!result.rows.length) {
    const error = new Error("Organization not found");
    error.status = 404;
    throw error;
  }
  return result.rows[0].organization_id;
};

export {
  getAllOrganizations,
  getOrganizationDetails,
  createOrganization,
  updateOrganization,
};
