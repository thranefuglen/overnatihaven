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

-- Insert default admin user (password: admin123)
-- Password hash: $2b$10$XWTwpMUZWNMH2hnn8./Xx.ZK79.lPklnXEiwnhUJ6hrhxrCPXiQAO
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$XWTwpMUZWNMH2hnn8./Xx.ZK79.lPklnXEiwnhUJ6hrhxrCPXiQAO')
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

-- Seed initial facilities
INSERT INTO facilities (title, description, icon_name, is_active, sort_order)
VALUES
    ('Toilet & Bad', 'Adgang til toilet og brusebad i forbindelse med overnatningen', 'Home', true, 1),
    ('Strøm', 'Mulighed for at oplade telefon og cykellygter', 'Zap', true, 2),
    ('Køkkenadgang', 'Mulighed for at tilberede let mad og drikke', 'UtensilsCrossed', true, 3),
    ('WiFi', 'Gratis trådløst internet i hele haven', 'Wifi', true, 4),
    ('Sikkert Område', 'Privat og sikkert område til parkering af cykler', 'ShieldCheck', true, 5),
    ('Udendørs Lys', 'God belysning i haven om aftenen', 'Moon', true, 6),
    ('Fælles Opholdsrum', 'Hyggeligt område at møde andre cyklister', 'Users', true, 7),
    ('Kort & Vejledning', 'Hjælp til at planlægge din videre rute', 'Map', true, 8)
ON CONFLICT DO NOTHING;

-- Insert sample gallery images
INSERT INTO gallery_images (title, description, image_url, sort_order, is_active)
VALUES
    ('Telt i haven', 'Smukt telt omgivet af grønne træer og blomster', 'https://images.unsplash.com/photo-1523987351232-1ca2c5be4eb5?w=800&h=600&fit=crop', 1, true),
    ('Camping plads', 'Rummelig camping plads med god plads til flere telte', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop', 2, true),
    ('Haven ved solnedgang', 'Den smukke have ved solnedgangstidspunkt', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop', 3, true),
    ('Bålplads', 'Hyggelig bålplads til sociale aftener', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop', 4, true),
    ('Faciliteter', 'Rene og velholdte faciliteter for gæster', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', 5, true),
    ('Natursti', 'Smuk natursti i nærheden af campingpladsen', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 6, true)
ON CONFLICT DO NOTHING;
