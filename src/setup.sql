-- W02 Middle of Week: run once against an empty course database.
-- No DROP or TRUNCATE: existing data is never silently erased.
BEGIN;

CREATE TABLE public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

CREATE TABLE public.project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES public.organization (organization_id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

INSERT INTO public.organization (name, description, contact_email, logo_filename)
VALUES
    ('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
    ('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
    ('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- On this fresh database SERIAL assigns organization IDs 1, 2, and 3.
INSERT INTO public.project (organization_id, title, description, location, date)
VALUES
    (1, 'Park Bench Restoration', 'Repair and repaint benches for neighborhood families.', 'Riverside Park', '2026-11-07'),
    (1, 'Community Ramp Build', 'Build an accessible entrance for a community center.', 'Hope Community Center', '2026-11-14'),
    (1, 'School Garden Beds', 'Construct raised beds for student gardening lessons.', 'Lincoln School', '2026-11-21'),
    (1, 'Library Shelf Installation', 'Install bookshelves in the neighborhood reading room.', 'Eastside Library', '2026-11-28'),
    (1, 'Playground Repair', 'Repair playground fixtures with the maintenance team.', 'Central Playground', '2026-12-05'),
    (2, 'Urban Garden Planting', 'Plant seasonal vegetables with neighborhood volunteers.', 'GreenHarvest Garden', '2026-11-08'),
    (2, 'Composting Workshop', 'Teach families how to compost kitchen scraps.', 'Garden Education Center', '2026-11-15'),
    (2, 'Community Harvest', 'Harvest vegetables for the local food pantry.', 'Northside Urban Farm', '2026-11-22'),
    (2, 'Seed Sharing Day', 'Sort and share seeds with local gardeners.', 'Community Market', '2026-11-29'),
    (2, 'Water Wise Garden Care', 'Install mulch and demonstrate water saving practices.', 'Southside Garden', '2026-12-06'),
    (3, 'Neighborhood Food Drive', 'Collect and distribute food donations to families.', 'UnityServe Food Pantry', '2026-11-09'),
    (3, 'Community Tutoring', 'Help students practice reading and mathematics.', 'Youth Learning Center', '2026-11-16'),
    (3, 'Senior Companion Visit', 'Visit older neighbors and share activities.', 'Sunrise Senior Center', '2026-11-23'),
    (3, 'Winter Clothing Sort', 'Sort donated clothing for community distribution.', 'UnityServe Donation Center', '2026-11-30'),
    (3, 'Charity Event Support', 'Set up tables and welcome guests at a charity event.', 'Town Community Hall', '2026-12-07');

COMMIT;

-- Expected: 3 organizations, 15 projects, 5 projects per organization.
SELECT organization_id, name, description, contact_email, logo_filename
FROM public.organization ORDER BY organization_id;
SELECT o.name, COUNT(p.project_id) AS project_count
FROM public.organization AS o
LEFT JOIN public.project AS p ON p.organization_id = o.organization_id
GROUP BY o.organization_id, o.name ORDER BY o.organization_id;
SELECT p.project_id, p.date, p.title, o.name AS organization_name
FROM public.project AS p
JOIN public.organization AS o ON p.organization_id = o.organization_id
ORDER BY p.date, p.project_id;
