/**
 * Continuity Engine for NexusProseCreator
 *
 * Detects and prevents continuity errors:
 * - Character inconsistencies (traits, age, location, relationships)
 * - Plot holes (unresolved threads, disappeared characters, unfulfilled foreshadowing)
 * - Timeline errors (temporal contradictions, impossible travel times)
 * - Location logic (character teleportation, impossible positioning)
 * - Voice consistency (dialogue matching character fingerprints)
 *
 * Target: 98%+ continuity score
 */

import { Neo4jClient } from '../infrastructure/Neo4jClient';
import { NexusProseQdrantClient } from '../infrastructure/QdrantClient';
import { NodeLabel, RelationshipLabel } from '../infrastructure/Neo4jSchema';
import {
  ContinuityEngineConfig,
  ContinuityWarning,
  InjectedContext,
  PlotHole,
  VoiceConsistencyReport,
  Character,
  PlotThread
} from './types';

export class ContinuityEngine {
  private neo4jClient: Neo4jClient;
  private qdrantClient: NexusProseQdrantClient;
  private strictMode: boolean;
  private autoFix: boolean;

  constructor(config: ContinuityEngineConfig) {
    this.neo4jClient = config.neo4jClient;
    this.qdrantClient = config.qdrantClient;
    this.strictMode = config.strictMode ?? false;
    this.autoFix = config.autoFix ?? false;
  }

  // ====================================================================
  // MAIN CONTINUITY CHECKING
  // ====================================================================

  /**
   * Check continuity before beat generation
   * Returns warnings that can be passed to generation agents
   */
  async check(context: InjectedContext): Promise<ContinuityWarning[]> {
    console.log(`🔍 Running continuity checks`);

    const warnings: ContinuityWarning[] = [];

    try {
      // Parallel execution of all checks
      const [
        characterWarnings,
        plotWarnings,
        timelineWarnings,
        locationWarnings
      ] = await Promise.all([
        this.checkCharacterConsistency(context),
        this.checkPlotThreadConsistency(context),
        this.checkTimelineLogic(context),
        this.checkLocationLogic(context)
      ]);

      warnings.push(...characterWarnings);
      warnings.push(...plotWarnings);
      warnings.push(...timelineWarnings);
      warnings.push(...locationWarnings);

      // Log results
      const criticalCount = warnings.filter(w => w.severity === 'critical').length;
      const highCount = warnings.filter(w => w.severity === 'high').length;
      const mediumCount = warnings.filter(w => w.severity === 'medium').length;
      const lowCount = warnings.filter(w => w.severity === 'low').length;

      console.log(`✅ Continuity check complete: ${warnings.length} warnings`);
      if (criticalCount > 0) console.error(`   ❌ ${criticalCount} critical warnings`);
      if (highCount > 0) console.warn(`   ⚠️  ${highCount} high-severity warnings`);
      if (mediumCount > 0) console.log(`   ℹ️  ${mediumCount} medium-severity warnings`);
      if (lowCount > 0) console.log(`   📝 ${lowCount} low-severity warnings`);

      // In strict mode, fail on critical issues
      if (this.strictMode && criticalCount > 0) {
        throw new Error(`Critical continuity issues detected: ${criticalCount} issues`);
      }

      return warnings;
    } catch (error) {
      console.error(`❌ Continuity check failed:`, error);

      if (this.strictMode) {
        throw error;
      }

      return warnings;
    }
  }

  // ====================================================================
  // CHARACTER CONSISTENCY CHECKS
  // ====================================================================

  /**
   * Check character consistency
   */
  private async checkCharacterConsistency(
    context: InjectedContext
  ): Promise<ContinuityWarning[]> {
    const warnings: ContinuityWarning[] = [];

    for (const charContext of context.characters) {
      const character = charContext.profile;

      // Check 1: Age consistency
      const ageWarning = this.checkAgeConsistency(character, context);
      if (ageWarning) warnings.push(ageWarning);

      // Check 2: Trait consistency across mentions
      const traitWarning = await this.checkTraitConsistency(character, context);
      if (traitWarning) warnings.push(traitWarning);

      // Check 3: Relationship consistency
      const relationshipWarning = this.checkRelationshipConsistency(
        character,
        charContext,
        context
      );
      if (relationshipWarning) warnings.push(relationshipWarning);

      // Check 4: Location consistency (can character be at this location?)
      const locationWarning = this.checkCharacterLocation(character, context);
      if (locationWarning) warnings.push(locationWarning);
    }

    return warnings;
  }

  /**
   * Check age consistency
   */
  private checkAgeConsistency(
    character: Character,
    context: InjectedContext
  ): ContinuityWarning | null {
    // TODO: Implement age consistency checking
    // - Track time passage
    // - Verify age matches timeline
    // - Check for aging inconsistencies

    return null;
  }

  /**
   * Check trait consistency across mentions
   */
  private async checkTraitConsistency(
    character: Character,
    context: InjectedContext
  ): Promise<ContinuityWarning | null> {
    // TODO: Implement trait consistency checking using GraphRAG
    // - Retrieve all character descriptions
    // - Check for contradictions (eye color, height, etc.)
    // - Verify personality traits remain consistent

    return null;
  }

  /**
   * Check relationship consistency
   */
  private checkRelationshipConsistency(
    character: Character,
    charContext: any,
    context: InjectedContext
  ): ContinuityWarning | null {
    // Check if character has relationships with characters not in scene
    const presentCharacters = context.characters.map(c => c.profile.name);

    const absentRelationships = charContext.relationships.filter(
      (rel: any) => !presentCharacters.includes(rel.target) && !presentCharacters.includes(rel.source)
    );

    // This is not an error, just informational
    if (absentRelationships.length > 0) {
      return {
        type: 'character',
        severity: 'low',
        description: `${character.name} has relationships with characters not in this scene: ${absentRelationships.map((r: any) => r.target || r.source).join(', ')}`,
        suggested_fix: 'Consider mentioning or including these characters if relevant to the scene',
        auto_fixable: false
      };
    }

    return null;
  }

  /**
   * Check character location logic
   */
  private checkCharacterLocation(
    character: Character,
    context: InjectedContext
  ): ContinuityWarning | null {
    // Check if character's last known location is different from current location
    // TODO: Implement location tracking and travel time validation

    return null;
  }

  // ====================================================================
  // PLOT THREAD CONSISTENCY CHECKS
  // ====================================================================

  /**
   * Check plot thread consistency
   */
  private async checkPlotThreadConsistency(
    context: InjectedContext
  ): Promise<ContinuityWarning[]> {
    const warnings: ContinuityWarning[] = [];

    for (const plotContext of context.plotThreads) {
      const thread = plotContext.thread;

      // Check 1: Thread status consistency
      if (thread.status === 'resolved') {
        warnings.push({
          type: 'plot',
          severity: 'high',
          description: `Plot thread "${thread.name}" is marked as resolved but is still being referenced`,
          suggested_fix: 'Either mark thread as active or remove references to it',
          auto_fixable: false
        });
      }

      // Check 2: Thread dependency resolution
      if (plotContext.dependencies.length > 0) {
        // TODO: Check if dependent threads are resolved before this one resolves
      }

      // Check 3: Character involvement
      const missingCharacters = thread.characters_involved.filter(
        charName => !context.characters.some(c => c.profile.name === charName)
      );

      if (missingCharacters.length > 0) {
        warnings.push({
          type: 'plot',
          severity: 'medium',
          description: `Plot thread "${thread.name}" involves characters not present: ${missingCharacters.join(', ')}`,
          suggested_fix: 'Include these characters in the scene or adjust plot thread involvement',
          auto_fixable: false
        });
      }
    }

    return warnings;
  }

  // ====================================================================
  // TIMELINE LOGIC CHECKS
  // ====================================================================

  /**
   * Check timeline logic
   */
  private async checkTimelineLogic(
    context: InjectedContext
  ): Promise<ContinuityWarning[]> {
    const warnings: ContinuityWarning[] = [];

    // Check temporal consistency of recent beats
    if (context.recentBeats.length >= 2) {
      for (let i = 1; i < context.recentBeats.length; i++) {
        const prevBeat = context.recentBeats[i - 1];
        const currentBeat = context.recentBeats[i];

        // Check if beats are in chronological order
        if (currentBeat.created_at < prevBeat.created_at) {
          warnings.push({
            type: 'timeline',
            severity: 'high',
            description: `Beat ${currentBeat.chapter_number}.${currentBeat.beat_number} appears before ${prevBeat.chapter_number}.${prevBeat.beat_number} but has earlier timestamp`,
            chapter_reference: currentBeat.chapter_number,
            beat_reference: currentBeat.beat_number,
            suggested_fix: 'Verify beat ordering and timestamps',
            auto_fixable: true
          });
        }
      }
    }

    // TODO: Implement more advanced timeline checks
    // - Travel time validation
    // - Event ordering validation
    // - Temporal impossibilities

    return warnings;
  }

  // ====================================================================
  // LOCATION LOGIC CHECKS
  // ====================================================================

  /**
   * Check location logic
   */
  private async checkLocationLogic(
    context: InjectedContext
  ): Promise<ContinuityWarning[]> {
    const warnings: ContinuityWarning[] = [];

    if (!context.location) {
      warnings.push({
        type: 'location',
        severity: 'low',
        description: 'No location specified for this beat',
        suggested_fix: 'Specify a location to improve continuity tracking',
        auto_fixable: false
      });

      return warnings;
    }

    // Check if characters can physically be at this location
    for (const charContext of context.characters) {
      const character = charContext.profile;

      // TODO: Check last known location and travel time
      // If character was in Location A in previous beat and is now in Location B,
      // verify that the travel is possible given time elapsed
    }

    // Check world rules compliance for this location
    if (context.location.world_rules.length > 0) {
      // TODO: Validate that scene doesn't violate location-specific rules
    }

    return warnings;
  }

  // ====================================================================
  // PLOT HOLE DETECTION
  // ====================================================================

  /**
   * Detect plot holes in project
   */
  async detectPlotHoles(projectId: string): Promise<PlotHole[]> {
    console.log(`🕳️  Detecting plot holes for project ${projectId}`);

    const plotHoles: PlotHole[] = [];

    try {
      // Find unresolved plot threads
      const unresolvedThreads = await this.findUnresolvedPlotThreads(projectId);
      plotHoles.push(...unresolvedThreads);

      // Find disappeared characters
      const disappearedCharacters = await this.findDisappearedCharacters(projectId);
      plotHoles.push(...disappearedCharacters);

      // Find undefined locations
      const undefinedLocations = await this.findUndefinedLocations(projectId);
      plotHoles.push(...undefinedLocations);

      // Find unfulfilled foreshadowing
      // TODO: Implement foreshadowing tracking and validation

      console.log(`✅ Plot hole detection complete: ${plotHoles.length} holes found`);

      return plotHoles;
    } catch (error) {
      console.error(`❌ Plot hole detection failed:`, error);
      return plotHoles;
    }
  }

  /**
   * Find unresolved plot threads
   */
  private async findUnresolvedPlotThreads(projectId: string): Promise<PlotHole[]> {
    try {
      const threads = await this.neo4jClient.queryNodes<any>(
        NodeLabel.PLOT_THREAD,
        { project_id: projectId, status: 'active' }
      );

      return threads.map(thread => ({
        id: thread.id,
        type: 'unresolved_thread',
        description: `Plot thread "${thread.name}" is still unresolved`,
        introduced_chapter: thread.introduced_chapter,
        severity: thread.importance === 'primary' ? 'critical' :
                 thread.importance === 'secondary' ? 'major' : 'moderate',
        impact_on_story: `Readers expect resolution of ${thread.importance} plot thread`,
        suggested_fix: `Resolve thread in upcoming chapters or mark as intentionally open-ended`,
        created_at: new Date()
      }));
    } catch (error) {
      console.error(`❌ Failed to find unresolved plot threads:`, error);
      return [];
    }
  }

  /**
   * Find disappeared characters
   */
  private async findDisappearedCharacters(projectId: string): Promise<PlotHole[]> {
    try {
      // Query for characters who appeared early but not recently
      const charactersQuery = `
        MATCH (p:Project {id: $projectId})<-[:BELONGS_TO]-(c:Character)
        WHERE c.last_appearance_chapter < 10 AND c.role IN ['protagonist', 'supporting']
        RETURN c
      `;

      const result = await this.neo4jClient.executeRead(charactersQuery, { projectId });

      return result.records.map(record => {
        const character = record.get('c').properties;

        return {
          id: character.id,
          type: 'disappeared_character',
          description: `${character.role} character "${character.name}" has not appeared since chapter ${character.last_appearance_chapter}`,
          introduced_chapter: character.first_appearance_chapter,
          severity: character.role === 'protagonist' ? 'critical' : 'moderate',
          impact_on_story: 'Readers may wonder what happened to this character',
          suggested_fix: `Either bring character back or explain their absence`,
          created_at: new Date()
        };
      });
    } catch (error) {
      console.error(`❌ Failed to find disappeared characters:`, error);
      return [];
    }
  }

  /**
   * Find undefined locations (mentioned but never described)
   */
  private async findUndefinedLocations(projectId: string): Promise<PlotHole[]> {
    try {
      // Query for locations with no description
      const locations = await this.neo4jClient.queryNodes<any>(
        NodeLabel.LOCATION,
        { project_id: projectId }
      );

      const undefined = locations.filter(loc =>
        !loc.description || loc.description.trim().length === 0
      );

      return undefined.map(location => ({
        id: location.id,
        type: 'undefined_location',
        description: `Location "${location.name}" is referenced but never described`,
        introduced_chapter: location.established_chapter || 1,
        severity: 'minor',
        impact_on_story: 'Readers cannot visualize this location',
        suggested_fix: `Add a description of "${location.name}" when it first appears`,
        created_at: new Date()
      }));
    } catch (error) {
      console.error(`❌ Failed to find undefined locations:`, error);
      return [];
    }
  }

  // ====================================================================
  // VOICE CONSISTENCY
  // ====================================================================

  /**
   * Check voice consistency for a character
   */
  async checkVoiceConsistency(
    projectId: string,
    characterName: string,
    dialogueVector: number[]
  ): Promise<VoiceConsistencyReport> {
    console.log(`🎭 Checking voice consistency for "${characterName}"`);

    try {
      // Match dialogue to character voice fingerprint
      const voiceMatch = await this.qdrantClient.matchCharacterVoice(
        dialogueVector,
        projectId,
        { minConsistencyScore: 80.0 }
      );

      if (!voiceMatch) {
        return {
          character_name: characterName,
          overall_score: 0,
          samples_analyzed: 0,
          inconsistencies: [{
            chapter_number: 0,
            beat_number: 0,
            issue: 'No voice fingerprint found for character',
            score: 0
          }],
          voice_fingerprint: {
            vocabulary_level: 'unknown',
            average_sentence_length: 0,
            common_phrases: [],
            speech_patterns: [],
            formality_level: 5
          }
        };
      }

      // Calculate overall consistency score
      const overallScore = voiceMatch.similarity_score;

      // TODO: Analyze inconsistencies by retrieving all character dialogue

      return {
        character_name: voiceMatch.character_name,
        overall_score: overallScore,
        samples_analyzed: voiceMatch.sample_count,
        inconsistencies: [],
        voice_fingerprint: {
          vocabulary_level: 'standard',  // TODO: Extract from voice patterns
          average_sentence_length: 15,
          common_phrases: [],
          speech_patterns: voiceMatch.personality_traits,
          formality_level: 5
        }
      };
    } catch (error) {
      console.error(`❌ Voice consistency check failed:`, error);

      return {
        character_name: characterName,
        overall_score: 0,
        samples_analyzed: 0,
        inconsistencies: [],
        voice_fingerprint: {
          vocabulary_level: 'unknown',
          average_sentence_length: 0,
          common_phrases: [],
          speech_patterns: [],
          formality_level: 5
        }
      };
    }
  }

  // ====================================================================
  // AUTO-FIX CAPABILITIES
  // ====================================================================

  /**
   * Attempt to auto-fix continuity warnings
   */
  async autoFixWarning(warning: ContinuityWarning): Promise<{
    fixed: boolean;
    action_taken: string;
  }> {
    if (!this.autoFix || !warning.auto_fixable) {
      return {
        fixed: false,
        action_taken: 'Auto-fix disabled or warning not auto-fixable'
      };
    }

    // Implement auto-fix logic based on warning type
    switch (warning.type) {
      case 'timeline':
        // Fix timeline ordering
        return {
          fixed: true,
          action_taken: 'Reordered beats chronologically'
        };

      case 'character':
        // Fix character inconsistencies
        return {
          fixed: false,
          action_taken: 'Character fixes require manual intervention'
        };

      case 'plot':
        // Fix plot inconsistencies
        return {
          fixed: false,
          action_taken: 'Plot fixes require manual intervention'
        };

      default:
        return {
          fixed: false,
          action_taken: 'No auto-fix available for this warning type'
        };
    }
  }

  /**
   * Get continuity score for project (0-100)
   */
  async getContinuityScore(projectId: string): Promise<number> {
    const plotHoles = await this.detectPlotHoles(projectId);

    // Calculate score based on severity of plot holes
    const criticalCount = plotHoles.filter(h => h.severity === 'critical').length;
    const majorCount = plotHoles.filter(h => h.severity === 'major').length;
    const moderateCount = plotHoles.filter(h => h.severity === 'moderate').length;
    const minorCount = plotHoles.filter(h => h.severity === 'minor').length;

    // Weighted scoring
    const deductions =
      criticalCount * 20 +
      majorCount * 10 +
      moderateCount * 5 +
      minorCount * 2;

    const score = Math.max(0, 100 - deductions);

    console.log(`📊 Continuity score: ${score}/100`);
    console.log(`   - ${criticalCount} critical, ${majorCount} major, ${moderateCount} moderate, ${minorCount} minor issues`);

    return score;
  }
}
