-- UN Entities Database Schema
-- Azure PostgreSQL Database

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS systemchart;

-- Drop table if exists
DROP TABLE IF EXISTS systemchart.entities CASCADE;

-- Create entities table
CREATE TABLE
    systemchart.entities (
        entity VARCHAR(255) PRIMARY KEY,
        entity_long TEXT,
        updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')
    );