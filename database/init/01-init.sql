-- ========================================
-- DevXP Database Initialization Script
-- ========================================
-- This script is automatically executed by Docker
-- when the PostgreSQL container is created for the first time
-- ========================================

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- Table: users
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'developer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ========================================
-- Table: apis
-- ========================================
CREATE TABLE IF NOT EXISTS apis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_url VARCHAR(500) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    headers JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for apis
CREATE INDEX IF NOT EXISTS idx_apis_user_id ON apis(user_id);
CREATE INDEX IF NOT EXISTS idx_apis_status ON apis(status);
CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category);

-- ========================================
-- Table: api_versions
-- ========================================
CREATE TABLE IF NOT EXISTS api_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    changelog TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for api_versions
CREATE INDEX IF NOT EXISTS idx_api_versions_api_id ON api_versions(api_id);
CREATE INDEX IF NOT EXISTS idx_api_versions_active ON api_versions(is_active);

-- ========================================
-- Table: services
-- ========================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    url VARCHAR(500) NOT NULL,
    is_critical BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_critical ON services(is_critical);

-- ========================================
-- Table: service_status
-- ========================================
CREATE TABLE IF NOT EXISTS service_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    response_time INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for service_status
CREATE INDEX IF NOT EXISTS idx_service_status_service_id ON service_status(service_id);
CREATE INDEX IF NOT EXISTS idx_service_status_checked_at ON service_status(checked_at);

-- ========================================
-- Table: logs
-- ========================================
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- ========================================
-- Table: templates
-- ========================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    language VARCHAR(50),
    framework VARCHAR(50),
    content JSONB NOT NULL,
    downloads INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_language ON templates(language);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);

-- ========================================
-- Triggers for updated_at
-- ========================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apis_updated_at BEFORE UPDATE ON apis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Seed Data (initial data)
-- ========================================

-- Default admin user (password: admin123)
-- IMPORTANT: Change this password in production!
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@devxp.local',
    '$2b$10$IPuoZpuwZo9RgUfq8woSmu1miTGrpvfXccDSmVxmWTWJjbuq.WB0.',  -- password: admin123
    'Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Example external services
INSERT INTO services (name, type, url, is_critical) VALUES
    ('PagBank API', 'payment', 'https://api.pagbank.com/health', true),
    ('IBM Watson', 'ai', 'https://api.ibm.com/health', false),
    ('DevOps Pipeline', 'devops', 'https://devops.company.com/health', true)
ON CONFLICT DO NOTHING;

-- Internal APIs monitoring
INSERT INTO services (name, type, url, is_critical) VALUES
    ('User Management API', 'internal', 'http://user-api:3001/v1/users', true),
    ('Payment Gateway API', 'internal', 'http://payment-api:3001/v1/payments', true),
    ('Product Catalog API', 'internal', 'http://product-api:3001/v1/products', false),
    ('Notification Service API', 'internal', 'http://notification-api:3001/v1/notifications', false),
    ('Analytics & Reports API', 'internal', 'http://analytics-api:3001/v1/analytics', false)
ON CONFLICT DO NOTHING;

-- Internal APIs (Examples)
INSERT INTO apis (user_id, name, description, base_url, method, category, status, tags)
SELECT
    u.id,
    'User Management API',
    'Complete user authentication and authorization service with OAuth2 support',
    'http://user-api:3001/v1/users',
    'GET',
    'authentication',
    'active',
    ARRAY['users', 'auth', 'oauth2']
FROM users u
WHERE u.email = 'admin@devxp.local'
UNION ALL
SELECT
    u.id,
    'Payment Gateway API',
    'Internal payment processing API supporting multiple payment methods',
    'http://payment-api:3001/v1/payments',
    'POST',
    'financial',
    'active',
    ARRAY['payments', 'billing', 'transactions']
FROM users u
WHERE u.email = 'admin@devxp.local'
UNION ALL
SELECT
    u.id,
    'Product Catalog API',
    'Product inventory and catalog management with real-time stock updates',
    'http://product-api:3001/v1/products',
    'GET',
    'business',
    'active',
    ARRAY['products', 'inventory', 'catalog']
FROM users u
WHERE u.email = 'admin@devxp.local'
UNION ALL
SELECT
    u.id,
    'Notification Service API',
    'Multi-channel notification service (email, SMS, push notifications)',
    'http://notification-api:3001/v1/notifications',
    'POST',
    'communication',
    'active',
    ARRAY['notifications', 'email', 'sms']
FROM users u
WHERE u.email = 'admin@devxp.local'
UNION ALL
SELECT
    u.id,
    'Analytics & Reports API',
    'Business intelligence and analytics data aggregation service',
    'http://analytics-api:3001/v1/analytics',
    'GET',
    'analytics',
    'active',
    ARRAY['analytics', 'reports', 'metrics']
FROM users u
WHERE u.email = 'admin@devxp.local'
ON CONFLICT DO NOTHING;

-- ========================================
-- Useful Views
-- ========================================

-- View: Latest service status
CREATE OR REPLACE VIEW latest_service_status AS
SELECT DISTINCT ON (service_id)
    s.id as service_id,
    s.name,
    s.type,
    s.url,
    s.is_critical,
    ss.status,
    ss.response_time,
    ss.error_message,
    ss.checked_at
FROM services s
LEFT JOIN service_status ss ON s.id = ss.service_id
ORDER BY service_id, checked_at DESC;

-- View: API statistics
CREATE OR REPLACE VIEW api_statistics AS
SELECT
    u.id as user_id,
    u.name as user_name,
    COUNT(a.id) as total_apis,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_apis,
    COUNT(CASE WHEN a.status = 'inactive' THEN 1 END) as inactive_apis
FROM users u
LEFT JOIN apis a ON u.id = a.user_id
GROUP BY u.id, u.name;

-- ========================================
-- Table Comments
-- ========================================

COMMENT ON TABLE users IS 'DevXP system users';
COMMENT ON TABLE apis IS 'Internal and external API catalog';
COMMENT ON TABLE api_versions IS 'API versioning';
COMMENT ON TABLE services IS 'Monitored external services';
COMMENT ON TABLE service_status IS 'Service health check history';
COMMENT ON TABLE logs IS 'Centralized system logs';
COMMENT ON TABLE templates IS 'Reusable code templates';

-- ========================================
-- Grant permissions
-- ========================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO devxp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO devxp_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO devxp_user;
