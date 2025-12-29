/**
 * NexusProseCreator - Living Blueprint System
 *
 * Centralized export for all blueprint modules:
 * - Types and interfaces
 * - BlueprintManager (orchestrator)
 * - BlueprintGenerator (initial creation)
 * - BlueprintEvolver (auto-updates)
 * - CharacterBibleManager (character consistency)
 * - PlotThreadTracker (plot management)
 * - TimelineManager (chronological tracking)
 * - ResearchBriefGenerator (LearningAgent integration)
 */

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

export type {
  // Core Blueprint Types
  SeriesBlueprint,
  ProjectBlueprint,
  ChapterBlueprint,
  BeatBlueprint,

  // Character Bible Types
  CharacterBible,
  CharacterCoreProfile,
  CharacterBackground,
  CharacterVoiceProfile,
  CharacterRelationship,
  CharacterArc,
  CharacterAppearance,
  CharacterEvolution,

  // Plot Thread Types
  PlotThread,
  PlotThreadStatus,
  PlotBeat,
  ForeshadowingElement,

  // World Building Types
  WorldBuildingElements,
  MagicSystem,
  TechnologyLevel,
  WorldLocation,
  Culture,
  HistoricalEvent,
  WorldRule,

  // Research Types
  ResearchBrief,
  KeyFact,
  Reference,

  // Blueprint Evolution Types
  BlueprintUpdate,
  BlueprintChange,
  Divergence,

  // Timeline Types
  SeriesTimeline,
  TimelineEvent,

  // Beat Types
  Beat,

  // Continuity Types
  ContinuityIssue,
  ContinuityCheck,

  // Enums
  BeatType,
  NarrativeFunction,
  PlotThreadType,
  PlotImportance,
  ArcType,
  ChangeType,
  ContinuityIssueType,
  ResearchType,

  // Supporting Types
  UniverseRules,
  CharacterSummary,
  PlotArc,
  TurningPoint,
  ArcDevelopment,
  FamilyMember,
  EmotionalCurve,
  EconomicSystem,
  PoliticalSystem,
  Faction,

  // API Input Types
  CreateSeriesBlueprintParams,
  CreateProjectBlueprintParams,
  EvolveBlueprintParams,
  GenerateCharacterBibleParams,
  GenerateResearchBriefParams,

  // Service Response Types
  BlueprintManagerResponse,
  EvolutionAnalysis,
  VoiceConsistencyReport,
  VoiceDeviation,

  // Error Types
  BlueprintError,
  CharacterBibleError,
  PlotThreadError,
  TimelineError,
  EvolutionError,
} from './types';

// ====================================================================
// BLUEPRINT MANAGER
// ====================================================================

export { BlueprintManager } from './BlueprintManager';
export type { BlueprintManagerConfig } from './BlueprintManager';

// ====================================================================
// BLUEPRINT GENERATOR
// ====================================================================

export { BlueprintGenerator } from './BlueprintGenerator';
export type {
  BlueprintGeneratorConfig,
  GenerateSeriesBlueprintParams,
  GenerateProjectBlueprintParams,
  GenerateChapterBlueprintParams,
  CharacterProfile,
} from './BlueprintGenerator';

// ====================================================================
// BLUEPRINT EVOLVER
// ====================================================================

export { BlueprintEvolver } from './BlueprintEvolver';
export type { BlueprintEvolverConfig, EvolveParams } from './BlueprintEvolver';

// ====================================================================
// CHARACTER BIBLE MANAGER
// ====================================================================

export { CharacterBibleManager } from './CharacterBibleManager';
export type {
  CharacterBibleManagerConfig,
  UpdateCharacterBibleParams,
} from './CharacterBibleManager';

// ====================================================================
// PLOT THREAD TRACKER
// ====================================================================

export { PlotThreadTracker } from './PlotThreadTracker';
export type { PlotThreadTrackerConfig } from './PlotThreadTracker';

// ====================================================================
// TIMELINE MANAGER
// ====================================================================

export { TimelineManager } from './TimelineManager';
export type {
  TimelineManagerConfig,
  AddTimelineEventParams,
} from './TimelineManager';

// ====================================================================
// RESEARCH BRIEF GENERATOR
// ====================================================================

export { ResearchBriefGenerator } from './ResearchBriefGenerator';
export type { ResearchBriefGeneratorConfig } from './ResearchBriefGenerator';

// ====================================================================
// FACTORY FUNCTIONS
// ====================================================================

/**
 * Create a complete blueprint system with all components
 */
export function createBlueprintSystem(config: {
  db: any;
  graphrag: any;
  mageAgent: any;
  learningAgent: any;
  qdrant: any;
  seriesIntelligence: any;
}): {
  blueprintManager: BlueprintManager;
  blueprintGenerator: BlueprintGenerator;
  blueprintEvolver: BlueprintEvolver;
  characterBibleManager: CharacterBibleManager;
  plotThreadTracker: PlotThreadTracker;
  timelineManager: TimelineManager;
  researchBriefGenerator: ResearchBriefGenerator;
} {
  // Create individual components
  const blueprintGenerator = new BlueprintGenerator({
    mageAgent: config.mageAgent,
  });

  const blueprintEvolver = new BlueprintEvolver({
    mageAgent: config.mageAgent,
  });

  const characterBibleManager = new CharacterBibleManager({
    mageAgent: config.mageAgent,
    db: config.db,
    graphrag: config.graphrag,
  });

  const plotThreadTracker = new PlotThreadTracker({
    db: config.db,
    qdrant: config.qdrant,
  });

  const timelineManager = new TimelineManager({
    db: config.db,
    mageAgent: config.mageAgent,
  });

  const researchBriefGenerator = new ResearchBriefGenerator({
    db: config.db,
    graphrag: config.graphrag,
    learningAgent: config.learningAgent,
  });

  // Create orchestrator
  const blueprintManager = new BlueprintManager({
    db: config.db,
    graphrag: config.graphrag,
    seriesIntelligence: config.seriesIntelligence,
    blueprintGenerator,
    blueprintEvolver,
    characterBibleManager,
    plotThreadTracker,
  });

  return {
    blueprintManager,
    blueprintGenerator,
    blueprintEvolver,
    characterBibleManager,
    plotThreadTracker,
    timelineManager,
    researchBriefGenerator,
  };
}

/**
 * Convenience re-exports for common operations
 */
export const BlueprintSystem = {
  createBlueprintSystem,
};
