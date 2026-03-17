-- UN Entities Database Schema
-- Azure PostgreSQL Database

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS systemchart;

-- Drop table if exists
-- 
-- DROP TABLE IF EXISTS systemchart.entities CASCADE;
-- Don’t DROP in prod; use upsert/refresh
-- Create entities table
CREATE TABLE
    systemchart.entities (
        entity VARCHAR(255) PRIMARY KEY,
        entity_long TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );


-- INSERT INTO systemchart.entities(entity, entity_long, updated_at)
-- VALUES ($1, $2, now())
-- ON CONFLICT (entity)
-- DO UPDATE SET
--   entity_long = EXCLUDED.entity_long,
--   updated_at  = now();


-- quality constraint
-- ALTER TABLE systemchart.entities
--   ADD CONSTRAINT entity_not_blank CHECK (length(trim(entity)) > 0);

-- -- allow apps to resolve + read
-- GRANT USAGE ON SCHEMA systemchart TO PUBLIC;
-- GRANT SELECT ON TABLE systemchart.entities TO PUBLIC;

-- -- prevent accidental writes by app roles
-- REVOKE INSERT, UPDATE, DELETE ON TABLE systemchart.entities FROM PUBLIC;
