-- Vercel Postgres Schema
-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    image_path TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    show_in_hero BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort_order ON gallery_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- Insert default admin user (password: Susi2010)
-- Password hash: $2b$10$fOzugvgbY6Cglded6fjd2uZC.dj.R.TbgQ.ErwH.CQNgIRj.SytOG
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$fOzugvgbY6Cglded6fjd2uZC.dj.R.TbgQ.ErwH.CQNgIRj.SytOG')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    num_people INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'declined', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_dates ON inquiries(arrival_date, departure_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for facilities
CREATE INDEX IF NOT EXISTS idx_facilities_sort_order ON facilities(sort_order);
CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON facilities(is_active);

-- Remove duplicate facilities before adding unique index
DELETE FROM facilities WHERE id NOT IN (SELECT MIN(id) FROM facilities GROUP BY title);

-- Add unique index on title to prevent duplicates from repeated migrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_facilities_title_unique ON facilities(title);

-- Seed initial facilities ONLY if the table is empty.
-- This preserves user deletions: når brugeren har slettet en facilitet i admin,
-- må migrationen ikke genoprette den ved næste deploy.
INSERT INTO facilities (title, description, icon_name, is_active, sort_order)
SELECT v.title, v.description, v.icon_name, v.is_active, v.sort_order
FROM (VALUES
    ('Toilet & Bad', 'Adgang til toilet og brusebad i forbindelse med overnatningen', 'Home', true, 1),
    ('Strøm', 'Mulighed for at oplade telefon og cykellygter', 'Zap', true, 2),
    ('Køkkenadgang', 'Mulighed for at tilberede let mad og drikke', 'UtensilsCrossed', true, 3),
    ('WiFi', 'Gratis trådløst internet i hele haven', 'Wifi', true, 4),
    ('Sikkert Område', 'Privat og sikkert område til parkering af cykler', 'ShieldCheck', true, 5),
    ('Udendørs Lys', 'God belysning i haven om aftenen', 'Moon', true, 6),
    ('Fælles Opholdsrum', 'Hyggeligt område at møde andre cyklister', 'Users', true, 7),
    ('Kort & Vejledning', 'Hjælp til at planlægge din videre rute', 'Map', true, 8)
) AS v(title, description, icon_name, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM facilities)
ON CONFLICT (title) DO NOTHING;

-- Remove duplicate gallery images before adding unique index
DELETE FROM gallery_images WHERE id NOT IN (SELECT MIN(id) FROM gallery_images GROUP BY image_url);

-- Add show_in_hero column if it doesn't exist (migration for existing databases)
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS show_in_hero BOOLEAN DEFAULT false;

-- Add unique index on image_url to prevent duplicates from repeated migrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_images_url_unique ON gallery_images(image_url);

-- No sample gallery images — all images are managed via the admin panel
