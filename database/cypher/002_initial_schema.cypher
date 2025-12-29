/**
 * NexusProseCreator - Neo4j Initial Schema
 *
 * This file defines the node and relationship types with example data structures.
 * It serves as documentation and can be used for testing.
 *
 * Run this after 001_constraints.cypher
 */

-- ============================================================================
-- NODE TYPE DEFINITIONS
-- ============================================================================

/**
 * PROJECT NODE
 * Represents a creative project (novel, screenplay, YouTube script, etc.)
 *
 * Properties:
 * - id: UUID (required, unique)
 * - title: String (required)
 * - format: String (required) - novel, screenplay, youtube_script, stage_play, etc.
 * - genre: String (required)
 * - subgenre: String (optional)
 * - target_word_count: Integer
 * - current_word_count: Integer
 * - consistency_score: Float (0-100)
 * - ai_detection_score: Float (0-100, lower is better)
 * - status: String - draft, revision, complete
 * - created_at: DateTime
 * - updated_at: DateTime
 */

-- Example Project node
CREATE (p:Project {
  id: 'proj-uuid-example',
  title: 'The Darkweaver Chronicles',
  format: 'novel',
  genre: 'Fantasy',
  subgenre: 'Epic Fantasy',
  target_word_count: 350000,
  current_word_count: 127450,
  consistency_score: 98.5,
  ai_detection_score: 3.1,
  status: 'draft',
  created_at: datetime(),
  updated_at: datetime()
});

/**
 * SERIES NODE
 * Represents a multi-book series or collection
 *
 * Properties:
 * - id: UUID (required, unique)
 * - title: String (required)
 * - description: Text
 * - total_word_count: Integer
 * - book_count: Integer
 * - universe_rules: JSON string (magic systems, tech rules, world laws)
 * - timeline: JSON string (chronological event tracking)
 * - created_at: DateTime
 */

-- Example Series node
CREATE (s:Series {
  id: 'series-uuid-example',
  title: 'The Darkweaver Chronicles Series',
  description: 'Epic fantasy series spanning 10 books',
  total_word_count: 3500000,
  book_count: 10,
  universe_rules: '{"magic_system": "Weave-based", "technology_level": "Medieval"}',
  timeline: '{"start_year": "Year 0", "current_year": "Year 523"}',
  created_at: datetime()
});

/**
 * CHARACTER NODE
 * Represents a character in the story
 *
 * Properties:
 * - id: UUID (required, unique)
 * - project_id: UUID (required, foreign key to Project)
 * - name: String (required)
 * - age: Integer
 * - role: String - protagonist, antagonist, supporting, minor
 * - first_appearance: Integer (chapter number)
 * - description: Text
 * - personality_traits: String (comma-separated or JSON)
 * - background: Text
 * - voice_pattern_id: UUID (reference to voice fingerprint in PostgreSQL)
 * - current_emotional_state: String
 * - current_location_id: UUID (reference to Location)
 * - arc_status: String - introduction, development, climax, resolution
 * - created_at: DateTime
 * - updated_at: DateTime
 */

-- Example Character node
CREATE (c:Character {
  id: 'char-uuid-example',
  project_id: 'proj-uuid-example',
  name: 'Kael Darkmoor',
  age: 28,
  role: 'protagonist',
  first_appearance: 1,
  description: 'A skilled warrior haunted by his past',
  personality_traits: 'brooding, loyal, strategic, haunted',
  background: 'Orphaned at age 10, trained by the Shadow Guild',
  voice_pattern_id: 'voice-uuid-example',
  current_emotional_state: 'conflicted',
  current_location_id: 'loc-uuid-tower',
  arc_status: 'development',
  created_at: datetime(),
  updated_at: datetime()
});

/**
 * LOCATION NODE
 * Represents a physical location in the story world
 *
 * Properties:
 * - id: UUID (required, unique)
 * - project_id: UUID (required)
 * - name: String (required)
 * - type: String - city, building, region, realm, planet, etc.
 * - description: Text
 * - parent_location_id: UUID (for hierarchical locations)
 * - significance: String - major, minor, background
 * - first_mentioned: Integer (chapter number)
 * - climate: String
 * - population: Integer
 * - culture_notes: Text
 * - created_at: DateTime
 */

-- Example Location nodes
CREATE (loc1:Location {
  id: 'loc-uuid-realm',
  project_id: 'proj-uuid-example',
  name: 'The Shadowlands',
  type: 'realm',
  description: 'A dark realm perpetually shrouded in twilight',
  parent_location_id: null,
  significance: 'major',
  first_mentioned: 1,
  climate: 'Temperate, perpetual dusk',
  population: 50000,
  culture_notes: 'Worshippers of the ancient shadow gods',
  created_at: datetime()
});

CREATE (loc2:Location {
  id: 'loc-uuid-tower',
  project_id: 'proj-uuid-example',
  name: 'The Obsidian Tower',
  type: 'building',
  description: 'A black tower rising from the heart of the Shadowlands',
  parent_location_id: 'loc-uuid-realm',
  significance: 'major',
  first_mentioned: 3,
  climate: 'Cold, windswept',
  population: 100,
  culture_notes: 'Home to the Shadow Council',
  created_at: datetime()
});

/**
 * PLOTTHREAD NODE
 * Represents a plot thread or storyline
 *
 * Properties:
 * - id: UUID (required, unique)
 * - project_id: UUID (required)
 * - name: String (required)
 * - description: Text
 * - status: String - introduced, developing, resolved, abandoned
 * - introduced_chapter: Integer
 * - resolved_chapter: Integer (null if unresolved)
 * - importance: String - main, subplot, background
 * - thread_type: String - mystery, romance, conflict, quest, etc.
 * - foreshadowing_elements: JSON string (list of foreshadowing moments)
 * - created_at: DateTime
 * - updated_at: DateTime
 */

-- Example PlotThread nodes
CREATE (pt1:PlotThread {
  id: 'plot-uuid-betrayal',
  project_id: 'proj-uuid-example',
  name: 'The Betrayal Revealed',
  description: 'Kael discovers Elara has been working against him',
  status: 'developing',
  introduced_chapter: 5,
  resolved_chapter: null,
  importance: 'main',
  thread_type: 'conflict',
  foreshadowing_elements: '["Ch5: Elara hesitates before answering", "Ch8: Secret meeting overhead"]',
  created_at: datetime(),
  updated_at: datetime()
});

CREATE (pt2:PlotThread {
  id: 'plot-uuid-artifact',
  project_id: 'proj-uuid-example',
  name: 'The Search for the Shadow Artifact',
  description: 'Quest to find the legendary artifact that can control shadows',
  status: 'introduced',
  introduced_chapter: 2,
  resolved_chapter: null,
  importance: 'main',
  thread_type: 'quest',
  foreshadowing_elements: '["Ch1: Old prophecy mentioned", "Ch2: Map fragment discovered"]',
  created_at: datetime(),
  updated_at: datetime()
});

/**
 * EVENT NODE
 * Represents a significant event in the story timeline
 *
 * Properties:
 * - id: UUID (required, unique)
 * - project_id: UUID (required)
 * - description: Text (required)
 * - timeline_position: String (e.g., "Year 523, Spring", "Day 5", etc.)
 * - chapter_number: Integer (where it occurs)
 * - event_type: String - battle, discovery, betrayal, death, birth, etc.
 * - significance: String - critical, major, minor
 * - participants: JSON string (list of character IDs involved)
 * - outcomes: Text (consequences of the event)
 * - created_at: DateTime
 */

-- Example Event node
CREATE (ev:Event {
  id: 'event-uuid-battle',
  project_id: 'proj-uuid-example',
  description: 'The Battle of Shadow's Edge',
  timeline_position: 'Year 523, Autumn',
  chapter_number: 15,
  event_type: 'battle',
  significance: 'critical',
  participants: '["char-uuid-kael", "char-uuid-elara", "char-uuid-villain"]',
  outcomes: 'Kael loses his sword, alliance broken, 50 soldiers dead',
  created_at: datetime()
});

/**
 * CHAPTER NODE
 * Represents a chapter in the manuscript
 *
 * Properties:
 * - id: UUID (required, unique)
 * - project_id: UUID (required)
 * - chapter_number: Integer (required)
 * - title: String
 * - synopsis: Text
 * - word_count: Integer
 * - status: String - outline, draft, revision, complete
 * - pov_character: String (character name or ID)
 * - timeline_position: String
 * - emotional_arc: String - rising, falling, stable, climax
 * - pacing_notes: Text
 * - created_at: DateTime
 * - updated_at: DateTime
 */

-- Example Chapter nodes
CREATE (ch1:Chapter {
  id: 'ch-uuid-1',
  project_id: 'proj-uuid-example',
  chapter_number: 1,
  title: 'Shadows Rising',
  synopsis: 'Kael receives the mysterious message that changes everything',
  word_count: 4500,
  status: 'complete',
  pov_character: 'Kael Darkmoor',
  timeline_position: 'Year 523, Spring, Day 1',
  emotional_arc: 'rising',
  pacing_notes: 'Hook strong, tension builds steadily',
  created_at: datetime(),
  updated_at: datetime()
});

CREATE (ch2:Chapter {
  id: 'ch-uuid-12',
  project_id: 'proj-uuid-example',
  chapter_number: 12,
  title: 'The Betrayal',
  synopsis: 'Kael confronts Elara about her secret',
  word_count: 5200,
  status: 'draft',
  pov_character: 'Kael Darkmoor',
  timeline_position: 'Year 523, Summer, Day 45',
  emotional_arc: 'climax',
  pacing_notes: 'High tension, dialogue-heavy',
  created_at: datetime(),
  updated_at: datetime()
});

/**
 * BEAT NODE (Optional, for fine-grained tracking)
 * Represents a story beat within a chapter
 *
 * Properties:
 * - id: UUID (required, unique)
 * - chapter_id: UUID (required, foreign key to Chapter)
 * - beat_number: Integer (required)
 * - beat_type: String - action, dialogue, description, transition
 * - word_count: Integer
 * - summary: Text
 * - created_at: DateTime
 */

-- Example Beat node
CREATE (b:Beat {
  id: 'beat-uuid-example',
  chapter_id: 'ch-uuid-12',
  beat_number: 1,
  beat_type: 'dialogue',
  word_count: 450,
  summary: 'Kael and Elara argue about the message',
  created_at: datetime()
});

-- ============================================================================
-- RELATIONSHIP TYPE DEFINITIONS
-- ============================================================================

/**
 * BELONGS_TO: Project belongs to Series
 * Properties: book_number (Integer)
 */
MATCH (p:Project {id: 'proj-uuid-example'})
MATCH (s:Series {id: 'series-uuid-example'})
CREATE (p)-[:BELONGS_TO {book_number: 3}]->(s);

/**
 * KNOWS: Character knows another Character
 * Properties:
 * - since: Integer (chapter number when relationship established)
 * - relationship_type: String (friend, enemy, ally, family, romantic, etc.)
 * - strength: Float (0-1, relationship strength)
 * - status: String (active, strained, broken, etc.)
 * - notes: Text
 */
MATCH (c1:Character {name: 'Kael Darkmoor'})
MATCH (c2:Character {name: 'Elara'})
CREATE (c1)-[:KNOWS {
  since: 1,
  relationship_type: 'ally',
  strength: 0.8,
  status: 'strained',
  notes: 'Childhood friends, now complicated by secrets'
}]->(c2);

/**
 * APPEARS_IN: Character appears in Chapter
 * Properties:
 * - chapter: Integer (chapter number)
 * - significance: String (major, minor, mentioned)
 * - dialogue_lines: Integer
 * - emotional_state: String
 */
MATCH (c:Character {name: 'Kael Darkmoor'})
MATCH (ch:Chapter {chapter_number: 12})
CREATE (c)-[:APPEARS_IN {
  chapter: 12,
  significance: 'major',
  dialogue_lines: 45,
  emotional_state: 'angry'
}]->(ch);

/**
 * INVOLVES: PlotThread involves Character
 * Properties:
 * - role: String (protagonist, antagonist, catalyst, victim, etc.)
 * - impact: String (high, medium, low)
 */
MATCH (pt:PlotThread {name: 'The Betrayal Revealed'})
MATCH (c:Character {name: 'Kael Darkmoor'})
CREATE (pt)-[:INVOLVES {
  role: 'protagonist',
  impact: 'high'
}]->(c);

/**
 * OCCURS_IN: PlotThread/Event occurs in Location
 * Properties:
 * - chapter: Integer (when it occurs)
 * - duration: String (how long the event lasts)
 */
MATCH (pt:PlotThread {name: 'The Betrayal Revealed'})
MATCH (loc:Location {name: 'The Obsidian Tower'})
CREATE (pt)-[:OCCURS_IN {
  chapter: 12,
  duration: 'one scene'
}]->(loc);

MATCH (ev:Event {event_type: 'battle'})
MATCH (loc:Location {name: 'The Shadowlands'})
CREATE (ev)-[:OCCURS_IN {
  chapter: 15,
  duration: 'three days'
}]->(loc);

/**
 * LOCATED_AT: Character is located at Location
 * Properties:
 * - chapter: Integer (current chapter)
 * - arrival_chapter: Integer (when they arrived)
 * - status: String (permanent, temporary, passing_through)
 */
MATCH (c:Character {name: 'Kael Darkmoor'})
MATCH (loc:Location {name: 'The Obsidian Tower'})
CREATE (c)-[:LOCATED_AT {
  chapter: 12,
  arrival_chapter: 10,
  status: 'temporary'
}]->(loc);

/**
 * FOLLOWS: Chapter follows another Chapter (sequential order)
 * Properties: none (structural relationship)
 */
MATCH (ch1:Chapter {chapter_number: 1})
MATCH (ch2:Chapter {chapter_number: 12})
CREATE (ch1)-[:FOLLOWS]->(ch2);

/**
 * EVOLVES_FROM: Character evolves from previous version (series-wide)
 * Properties:
 * - book: Integer (which book in series)
 * - changes: Text (what changed)
 */
-- Example for multi-book series
CREATE (c_old:Character {
  id: 'char-uuid-kael-book2',
  name: 'Kael Darkmoor',
  age: 26,
  role: 'protagonist'
});

MATCH (c_new:Character {name: 'Kael Darkmoor', age: 28})
CREATE (c_old)-[:EVOLVES_FROM {
  book: 3,
  changes: 'More cynical, battle-scarred, gained shadow powers'
}]->(c_new);

/**
 * DEVELOPS: PlotThread develops from another PlotThread
 * Properties:
 * - trigger_chapter: Integer (when the development occurs)
 */
MATCH (pt1:PlotThread {name: 'The Search for the Shadow Artifact'})
MATCH (pt2:PlotThread {name: 'The Betrayal Revealed'})
CREATE (pt1)-[:DEVELOPS {
  trigger_chapter: 10
}]->(pt2);

/**
 * CONTAINS: Location contains another Location (hierarchical)
 * Properties: none (structural relationship)
 */
MATCH (realm:Location {name: 'The Shadowlands'})
MATCH (tower:Location {name: 'The Obsidian Tower'})
CREATE (realm)-[:CONTAINS]->(tower);

/**
 * PART_OF: Chapter is part of Project
 * Properties: none (structural relationship)
 */
MATCH (ch:Chapter {chapter_number: 12})
MATCH (p:Project {title: 'The Darkweaver Chronicles'})
CREATE (ch)-[:PART_OF]->(p);

/**
 * PARTICIPATES_IN: Character participates in Event
 * Properties:
 * - role: String (attacker, defender, witness, victim, etc.)
 * - outcome: Text (what happened to them)
 */
MATCH (c:Character {name: 'Kael Darkmoor'})
MATCH (ev:Event {event_type: 'battle'})
CREATE (c)-[:PARTICIPATES_IN {
  role: 'defender',
  outcome: 'Wounded but victorious'
}]->(ev);

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Get all characters in a project
-- MATCH (c:Character {project_id: 'proj-uuid-example'})
-- RETURN c.name, c.role, c.first_appearance
-- ORDER BY c.first_appearance;

-- Get character's relationships
-- MATCH (c:Character {name: 'Kael Darkmoor'})-[r:KNOWS]->(other:Character)
-- RETURN other.name, r.relationship_type, r.since, r.status;

-- Get all plot threads involving a character
-- MATCH (pt:PlotThread)-[r:INVOLVES]->(c:Character {name: 'Kael Darkmoor'})
-- RETURN pt.name, pt.status, r.role, r.impact;

-- Get chapter timeline with characters
-- MATCH (ch:Chapter {project_id: 'proj-uuid-example'})
-- OPTIONAL MATCH (c:Character)-[:APPEARS_IN]->(ch)
-- RETURN ch.chapter_number, ch.title, collect(c.name) as characters
-- ORDER BY ch.chapter_number;

-- Get location hierarchy
-- MATCH (parent:Location)-[:CONTAINS*]->(child:Location)
-- WHERE parent.name = 'The Shadowlands'
-- RETURN parent.name, child.name, child.type;

-- Get unresolved plot threads
-- MATCH (pt:PlotThread {project_id: 'proj-uuid-example', status: 'developing'})
-- RETURN pt.name, pt.introduced_chapter, pt.importance;

-- Get character arc progression
-- MATCH (c:Character {name: 'Kael Darkmoor'})-[:APPEARS_IN]->(ch:Chapter)
-- RETURN ch.chapter_number, ch.title, c.current_emotional_state
-- ORDER BY ch.chapter_number;

-- Get series-wide character evolution
-- MATCH path = (c_old:Character)-[:EVOLVES_FROM*]->(c_new:Character)
-- WHERE c_new.name = 'Kael Darkmoor'
-- RETURN nodes(path);

/**
 * CLEANUP (for testing - removes all example data)
 */
-- MATCH (n)
-- WHERE n:Project OR n:Series OR n:Character OR n:Location OR n:PlotThread OR n:Event OR n:Chapter OR n:Beat
-- DETACH DELETE n;
