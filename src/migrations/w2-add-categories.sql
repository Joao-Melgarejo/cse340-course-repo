-- Run against an existing W02 database with public.organization and public.project.
-- Preserves existing organizations, projects, categories and links; safe to rerun
-- when any existing category tables have the same schema as this script.
BEGIN;

CREATE TABLE IF NOT EXISTS public.category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE CHECK (BTRIM(name) <> '')
);

CREATE TABLE IF NOT EXISTS public.project_category (
    project_id INTEGER NOT NULL REFERENCES public.project (project_id),
    category_id INTEGER NOT NULL REFERENCES public.category (category_id),
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO public.category (name)
VALUES ('Environmental'), ('Educational'), ('Community Service'), ('Health and Wellness')
ON CONFLICT (name) DO NOTHING;

-- Resolve IDs from the actual rows, not assumed category or project IDs.
-- Every existing project receives a primary category; some receive a second one.
INSERT INTO public.project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM public.project AS p
CROSS JOIN public.category AS c
WHERE c.name = CASE
    WHEN p.title IN ('School Garden Beds', 'Urban Garden Planting', 'Composting Workshop',
                     'Community Harvest', 'Seed Sharing Day', 'Water Wise Garden Care')
        THEN 'Environmental'
    WHEN p.title IN ('Library Shelf Installation', 'Community Tutoring')
        THEN 'Educational'
    WHEN p.title = 'Senior Companion Visit' THEN 'Health and Wellness'
    ELSE 'Community Service'
END
OR (c.name = 'Educational' AND p.title IN
    ('School Garden Beds', 'Composting Workshop', 'Water Wise Garden Care'))
OR (c.name = 'Community Service' AND p.title = 'Senior Companion Visit')
ON CONFLICT (project_id, category_id) DO NOTHING;

COMMIT;

SELECT category_id, name FROM public.category ORDER BY name, category_id;
SELECT COUNT(*) AS category_links FROM public.project_category;
SELECT p.project_id, p.title
FROM public.project AS p
WHERE NOT EXISTS (
    SELECT 1 FROM public.project_category AS pc WHERE pc.project_id = p.project_id
);
