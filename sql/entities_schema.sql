-- UN Entities Database Schema
-- Azure PostgreSQL Database
-- Drop table if exists
DROP TABLE IF EXISTS entities;

-- Create entities table
CREATE TABLE
    entities (
        entity VARCHAR(255) PRIMARY KEY,
        entity_long TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );