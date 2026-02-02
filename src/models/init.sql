-- Database Schema for Therian Game
-- Location-based AR game with GPS validation

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Locations table (GPS zones for gameplay)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL, -- GPS validation radius (50-80m)
    scene_file VARCHAR(255), -- .glb file reference
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User location progress (tracking which locations user has visited)
CREATE TABLE IF NOT EXISTS user_location_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    first_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visit_count INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT false,
    UNIQUE(user_id, location_id)
);

-- User inventory (items collected)
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50), -- 'collectible', 'powerup', 'key'
    quantity INTEGER DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_id INTEGER REFERENCES locations(id) -- Where item was obtained
);

-- Game events (special events, challenges)
CREATE TABLE IF NOT EXISTS game_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location_id INTEGER REFERENCES locations(id),
    reward_type VARCHAR(50),
    reward_value TEXT,
    is_active BOOLEAN DEFAULT true
);

-- User event participation
CREATE TABLE IF NOT EXISTS user_event_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES game_events(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    progress_data JSONB,
    UNIQUE(user_id, event_id)
);

-- GPS validation logs (anti-cheat)
CREATE TABLE IF NOT EXISTS gps_validation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_meters DECIMAL(8, 2),
    is_valid BOOLEAN,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_ip INET
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_location_progress_user ON user_location_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_progress_location ON user_location_progress(location_id);
CREATE INDEX IF NOT EXISTS idx_gps_validation_logs_user ON gps_validation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gps_validation_logs_timestamp ON gps_validation_logs(timestamp);

-- Insert sample locations (Buenos Aires landmarks)
INSERT INTO locations (name, description, latitude, longitude, radius_meters, scene_file) VALUES
('Planetario Galileo Galilei', 'Planetario de Buenos Aires', -34.5657, -58.4108, 75, 'planetario.glb'),
('Obelisco', 'Icono de Buenos Aires', -34.6037, -58.3816, 80, 'obelisco.glb'),
('Plaza de Mayo', 'Plaza histórica central', -34.6085, -58.3732, 100, 'plaza_mayo.glb')
ON CONFLICT DO NOTHING;
