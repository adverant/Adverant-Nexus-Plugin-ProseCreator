/**
 * NexusProseCreator - Neo4j Constraints and Indexes
 *
 * This file defines:
 * - Unique constraints for node IDs
 * - Indexes for performance optimization
 * - Full-text search indexes
 *
 * Run this file first before creating any nodes or relationships
 */

-- ============================================================================
-- UNIQUE CONSTRAINTS (Ensure data integrity)
-- ============================================================================

-- Project nodes (Books, Scripts, etc.)
CREATE CONSTRAINT project_id_unique IF NOT EXISTS
FOR (p:Project)
REQUIRE p.id IS UNIQUE;

-- Series nodes (Multi-book collections)
CREATE CONSTRAINT series_id_unique IF NOT EXISTS
FOR (s:Series)
REQUIRE s.id IS UNIQUE;

-- Character nodes
CREATE CONSTRAINT character_id_unique IF NOT EXISTS
FOR (c:Character)
REQUIRE c.id IS UNIQUE;

-- Location nodes
CREATE CONSTRAINT location_id_unique IF NOT EXISTS
FOR (l:Location)
REQUIRE l.id IS UNIQUE;

-- PlotThread nodes
CREATE CONSTRAINT plotthread_id_unique IF NOT EXISTS
FOR (pt:PlotThread)
REQUIRE pt.id IS UNIQUE;

-- Event nodes
CREATE CONSTRAINT event_id_unique IF NOT EXISTS
FOR (e:Event)
REQUIRE e.id IS UNIQUE;

-- Chapter nodes
CREATE CONSTRAINT chapter_id_unique IF NOT EXISTS
FOR (ch:Chapter)
REQUIRE ch.id IS UNIQUE;

-- Beat nodes (optional, for fine-grained tracking)
CREATE CONSTRAINT beat_id_unique IF NOT EXISTS
FOR (b:Beat)
REQUIRE b.id IS UNIQUE;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Index on project titles for search
CREATE INDEX project_title_index IF NOT EXISTS
FOR (p:Project)
ON (p.title);

-- Index on series titles
CREATE INDEX series_title_index IF NOT EXISTS
FOR (s:Series)
ON (s.title);

-- Index on character names for quick lookup
CREATE INDEX character_name_index IF NOT EXISTS
FOR (c:Character)
ON (c.name);

-- Index on character project_id for filtering by project
CREATE INDEX character_project_index IF NOT EXISTS
FOR (c:Character)
ON (c.project_id);

-- Index on location names
CREATE INDEX location_name_index IF NOT EXISTS
FOR (l:Location)
ON (l.name);

-- Index on location project_id
CREATE INDEX location_project_index IF NOT EXISTS
FOR (l:Location)
ON (l.project_id);

-- Index on plot thread names
CREATE INDEX plotthread_name_index IF NOT EXISTS
FOR (pt:PlotThread)
ON (pt.name);

-- Index on plot thread status (open, resolved, abandoned)
CREATE INDEX plotthread_status_index IF NOT EXISTS
FOR (pt:PlotThread)
ON (pt.status);

-- Index on plot thread project_id
CREATE INDEX plotthread_project_index IF NOT EXISTS
FOR (pt:PlotThread)
ON (pt.project_id);

-- Index on event timeline position
CREATE INDEX event_timeline_index IF NOT EXISTS
FOR (e:Event)
ON (e.timeline_position);

-- Index on event project_id
CREATE INDEX event_project_index IF NOT EXISTS
FOR (e:Event)
ON (e.project_id);

-- Index on chapter number for ordering
CREATE INDEX chapter_number_index IF NOT EXISTS
FOR (ch:Chapter)
ON (ch.chapter_number);

-- Index on chapter project_id
CREATE INDEX chapter_project_index IF NOT EXISTS
FOR (ch:Chapter)
ON (ch.project_id);

-- Index on beat number within chapter
CREATE INDEX beat_number_index IF NOT EXISTS
FOR (b:Beat)
ON (b.beat_number);

-- Index on beat chapter_id
CREATE INDEX beat_chapter_index IF NOT EXISTS
FOR (b:Beat)
ON (b.chapter_id);

-- ============================================================================
-- FULL-TEXT SEARCH INDEXES (For semantic search)
-- ============================================================================

-- Full-text index on character descriptions
CREATE FULLTEXT INDEX character_fulltext IF NOT EXISTS
FOR (c:Character)
ON EACH [c.name, c.description, c.personality_traits, c.background];

-- Full-text index on location descriptions
CREATE FULLTEXT INDEX location_fulltext IF NOT EXISTS
FOR (l:Location)
ON EACH [l.name, l.description, l.type];

-- Full-text index on plot thread descriptions
CREATE FULLTEXT INDEX plotthread_fulltext IF NOT EXISTS
FOR (pt:PlotThread)
ON EACH [pt.name, pt.description];

-- Full-text index on event descriptions
CREATE FULLTEXT INDEX event_fulltext IF NOT EXISTS
FOR (e:Event)
ON EACH [e.description, e.significance];

-- Full-text index on chapter content
CREATE FULLTEXT INDEX chapter_fulltext IF NOT EXISTS
FOR (ch:Chapter)
ON EACH [ch.title, ch.synopsis];

-- ============================================================================
-- COMPOSITE INDEXES (Multi-property lookups)
-- ============================================================================

-- Composite index on character (project_id, first_appearance)
CREATE INDEX character_project_appearance IF NOT EXISTS
FOR (c:Character)
ON (c.project_id, c.first_appearance);

-- Composite index on chapter (project_id, chapter_number)
CREATE INDEX chapter_project_number IF NOT EXISTS
FOR (ch:Chapter)
ON (ch.project_id, ch.chapter_number);

-- Composite index on plot thread (project_id, status)
CREATE INDEX plotthread_project_status IF NOT EXISTS
FOR (pt:PlotThread)
ON (pt.project_id, pt.status);

-- ============================================================================
-- RELATIONSHIP INDEXES (For fast relationship traversal)
-- ============================================================================

-- Index on APPEARS_IN relationship chapter property
CREATE INDEX appears_in_chapter IF NOT EXISTS
FOR ()-[r:APPEARS_IN]-()
ON (r.chapter);

-- Index on KNOWS relationship since property
CREATE INDEX knows_since IF NOT EXISTS
FOR ()-[r:KNOWS]-()
ON (r.since);

-- Index on EVOLVES_FROM relationship book property
CREATE INDEX evolves_from_book IF NOT EXISTS
FOR ()-[r:EVOLVES_FROM]-()
ON (r.book);

-- Index on LOCATED_AT relationship chapter property
CREATE INDEX located_at_chapter IF NOT EXISTS
FOR ()-[r:LOCATED_AT]-()
ON (r.chapter);

/**
 * NOTES:
 *
 * 1. All constraints and indexes use "IF NOT EXISTS" for idempotency
 * 2. Unique constraints automatically create indexes, so no separate index needed for IDs
 * 3. Full-text indexes enable semantic search with CALL db.index.fulltext.queryNodes()
 * 4. Composite indexes improve multi-condition queries
 * 5. Relationship indexes speed up relationship property filters
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Indexes improve read performance but add overhead to writes
 * - Full-text indexes are rebuilt asynchronously
 * - For very large datasets (>1M nodes), consider additional indexes on frequently queried properties
 *
 * VERIFY INDEXES:
 * SHOW CONSTRAINTS;
 * SHOW INDEXES;
 */
