-- =============================================
-- LOST AND FOUND SYSTEM - DATABASE SCHEMA
-- Zambia University of Technology
-- =============================================

-- Create database (run this separately as superuser if needed)
-- CREATE DATABASE lost_and_found;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'staff')),
    student_id VARCHAR(30),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (LOWER(category) IN ('electronics', 'clothing', 'accessories', 'documents', 'keys', 'bags', 'books', 'other', 'wallet', 'phone', 'laptop', 'jewelry', 'stationery', 'personal items')),
    status VARCHAR(20) DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'claimed', 'resolved')),
    location VARCHAR(200) NOT NULL,
    date_lost_found DATE NOT NULL,
    image_url VARCHAR(500),
    reported_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimed_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table (tracks who claimed what)
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    claimed_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, claimed_by)
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_timestamp
BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Seed admin user (password: admin123)
INSERT INTO users (full_name, email, password_hash, role)
VALUES ('System Admin', 'admin@zut.edu.zm', '$2b$10$65O8E1pubSB2R4ZKqb6zY.sslM7vLYflW58ebTy2RFHrUFO5j2enS', 'admin')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin';
