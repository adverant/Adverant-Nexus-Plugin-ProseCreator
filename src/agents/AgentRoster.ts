/**
 * Agent Roster - 50+ Specialized AI Agents for Creative Writing
 * NexusProseCreator - AI-Powered Content Generation
 *
 * Each agent is a specialized persona designed for specific creative tasks
 */

import {
  AgentDefinition,
  AgentCategory,
  AgentRole,
  AIModel
} from './types';

/**
 * Complete roster of 50+ specialized agents
 */
export class AgentRoster {
  private static readonly agents: Map<AgentRole, AgentDefinition> = new Map([

    // =========================================================================
    // ORCHESTRATION AGENTS
    // =========================================================================

    ['director', {
      role: 'director',
      category: AgentCategory.ORCHESTRATION,
      description: 'Central orchestrator that coordinates all agents and manages workflow',
      specializations: [
        'Task delegation',
        'Priority management',
        'Conflict resolution',
        'Resource optimization',
        'Quality gate enforcement'
      ],
      capabilities: [
        'Decomposes complex writing tasks into subtasks',
        'Assigns optimal agents to each subtask',
        'Manages parallel execution',
        'Synthesizes multi-agent outputs',
        'Ensures consistency across all contributions'
      ],
      model: AIModel.GPT4O,
      priority: 10,
      estimatedDuration: '1-3 seconds'
    }],

    ['synthesis-agent', {
      role: 'synthesis-agent',
      category: AgentCategory.ORCHESTRATION,
      description: 'Combines multi-agent outputs into coherent final content',
      specializations: [
        'Output merging',
        'Style harmonization',
        'Transition smoothing',
        'Redundancy elimination',
        'Quality synthesis'
      ],
      capabilities: [
        'Merges outputs from multiple specialist agents',
        'Ensures consistent voice across contributions',
        'Smooths transitions between agent-generated sections',
        'Eliminates contradictions and redundancy',
        'Produces final coherent output'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '2-5 seconds'
    }],

    // =========================================================================
    // STORY PLANNING AGENTS
    // =========================================================================

    ['plot-architect', {
      role: 'plot-architect',
      category: AgentCategory.STORY_PLANNING,
      description: 'Designs overarching plot structure and story architecture',
      specializations: [
        '3-Act Structure',
        '5-Act Structure',
        'Hero\'s Journey',
        'Save the Cat',
        'Freytag\'s Pyramid',
        'Multi-thread plotting'
      ],
      capabilities: [
        'Creates comprehensive plot outlines',
        'Structures story beats for maximum impact',
        'Balances multiple plot threads',
        'Ensures proper pacing and tension escalation',
        'Designs satisfying resolutions'
      ],
      model: AIModel.GPT4O,
      priority: 9,
      estimatedDuration: '5-10 seconds'
    }],

    ['subplot-weaver', {
      role: 'subplot-weaver',
      category: AgentCategory.STORY_PLANNING,
      description: 'Creates interwoven subplot threads that enhance main narrative',
      specializations: [
        'Subplot creation',
        'Thread interweaving',
        'Parallel storylines',
        'Subplot resolution',
        'Theme reinforcement through subplots'
      ],
      capabilities: [
        'Generates compelling subplot ideas',
        'Weaves subplots into main narrative',
        'Ensures subplot-main plot integration',
        'Times subplot beats for narrative rhythm',
        'Resolves subplots satisfactorily'
      ],
      model: AIModel.CLAUDE_SONNET_37,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['pacing-optimizer', {
      role: 'pacing-optimizer',
      category: AgentCategory.STORY_PLANNING,
      description: 'Analyzes and optimizes narrative pacing for reader engagement',
      specializations: [
        'Scene energy analysis',
        'Chapter rhythm',
        'Act pacing',
        'Tension curves',
        'Reader engagement optimization'
      ],
      capabilities: [
        'Analyzes pacing of existing content',
        'Identifies slow or rushed sections',
        'Recommends pacing adjustments',
        'Balances action/reflection/dialogue',
        'Creates optimal reading flow'
      ],
      model: AIModel.CLAUDE_SONNET_37,
      priority: 8,
      estimatedDuration: '3-6 seconds'
    }],

    ['tension-builder', {
      role: 'tension-builder',
      category: AgentCategory.STORY_PLANNING,
      description: 'Identifies points to increase/decrease tension for maximum impact',
      specializations: [
        'Conflict escalation',
        'Stakes raising',
        'Cliffhanger creation',
        'Suspense building',
        'Tension release timing'
      ],
      capabilities: [
        'Analyzes tension levels throughout narrative',
        'Identifies opportunities for heightened tension',
        'Creates effective cliffhangers',
        'Balances tension and release',
        'Maintains reader engagement'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '3-7 seconds'
    }],

    ['foreshadowing-specialist', {
      role: 'foreshadowing-specialist',
      category: AgentCategory.STORY_PLANNING,
      description: 'Plants and tracks foreshadowing elements for payoffs',
      specializations: [
        'Subtle foreshadowing',
        'Chekhov\'s gun tracking',
        'Payoff timing',
        'Red herring placement',
        'Symbolism and motifs'
      ],
      capabilities: [
        'Identifies opportunities for foreshadowing',
        'Plants subtle hints and clues',
        'Tracks all foreshadowing elements',
        'Ensures proper payoffs',
        'Balances obvious and subtle foreshadowing'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['theme-analyst', {
      role: 'theme-analyst',
      category: AgentCategory.STORY_PLANNING,
      description: 'Analyzes and reinforces thematic elements throughout narrative',
      specializations: [
        'Theme identification',
        'Thematic coherence',
        'Symbolic reinforcement',
        'Subtext development',
        'Message clarity'
      ],
      capabilities: [
        'Identifies core themes in narrative',
        'Ensures thematic consistency',
        'Suggests theme reinforcement opportunities',
        'Analyzes symbolic elements',
        'Maintains thematic depth'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 6,
      estimatedDuration: '5-10 seconds'
    }],

    ['story-structure-expert', {
      role: 'story-structure-expert',
      category: AgentCategory.STORY_PLANNING,
      description: 'Ensures adherence to chosen story structure framework',
      specializations: [
        'Structure templates',
        'Beat sheet validation',
        'Structural analysis',
        'Genre-appropriate structures',
        'Custom structure design'
      ],
      capabilities: [
        'Validates story against structural frameworks',
        'Identifies structural weaknesses',
        'Recommends structural improvements',
        'Adapts structures to genre requirements',
        'Creates custom hybrid structures'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '4-9 seconds'
    }],

    // =========================================================================
    // CHARACTER DEVELOPMENT AGENTS
    // =========================================================================

    ['character-psychologist', {
      role: 'character-psychologist',
      category: AgentCategory.CHARACTER,
      description: 'Creates deep psychological profiles and motivations',
      specializations: [
        'Psychological profiling',
        'Motivation analysis',
        'Backstory development',
        'Trauma and growth',
        'Internal conflict design'
      ],
      capabilities: [
        'Develops comprehensive character psychologies',
        'Creates believable motivations',
        'Designs compelling backstories',
        'Ensures psychological consistency',
        'Tracks character mental states'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '6-12 seconds'
    }],

    ['dialogue-specialist', {
      role: 'dialogue-specialist',
      category: AgentCategory.CHARACTER,
      description: 'Ensures character-specific dialogue patterns and authenticity',
      specializations: [
        'Natural dialogue',
        'Character voice differentiation',
        'Subtext in dialogue',
        'Dialect and vernacular',
        'Conversational rhythm'
      ],
      capabilities: [
        'Generates character-appropriate dialogue',
        'Ensures each character has distinct voice',
        'Adds subtext and layering',
        'Creates natural conversation flow',
        'Maintains dialogue consistency'
      ],
      model: AIModel.GEMINI_20_FLASH,
      priority: 9,
      estimatedDuration: '3-6 seconds'
    }],

    ['arc-designer', {
      role: 'arc-designer',
      category: AgentCategory.CHARACTER,
      description: 'Designs compelling character development arcs',
      specializations: [
        'Character arc structures',
        'Transformation design',
        'Growth tracking',
        'Arc pacing',
        'Multi-book arcs'
      ],
      capabilities: [
        'Creates compelling character arcs',
        'Tracks character evolution',
        'Ensures believable transformation',
        'Paces character growth appropriately',
        'Designs series-spanning arcs'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['relationship-mapper', {
      role: 'relationship-mapper',
      category: AgentCategory.CHARACTER,
      description: 'Tracks and develops character relationship dynamics',
      specializations: [
        'Relationship mapping',
        'Dynamic evolution',
        'Conflict creation',
        'Relationship arcs',
        'Social network analysis'
      ],
      capabilities: [
        'Maps all character relationships',
        'Tracks relationship evolution',
        'Creates relationship conflicts',
        'Ensures relationship consistency',
        'Designs compelling relationship arcs'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['voice-consistency-guard', {
      role: 'voice-consistency-guard',
      category: AgentCategory.CHARACTER,
      description: 'Ensures character voice remains consistent throughout',
      specializations: [
        'Voice fingerprinting',
        'Consistency validation',
        'Voice drift detection',
        'Dialect maintenance',
        'Speech pattern analysis'
      ],
      capabilities: [
        'Creates voice fingerprints for each character',
        'Validates dialogue against fingerprints',
        'Detects voice inconsistencies',
        'Maintains consistent speech patterns',
        'Ensures 95%+ voice consistency'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '2-5 seconds'
    }],

    ['character-evolution-tracker', {
      role: 'character-evolution-tracker',
      category: AgentCategory.CHARACTER,
      description: 'Tracks character knowledge, state, and evolution across story',
      specializations: [
        'Knowledge tracking',
        'State management',
        'Evolution timeline',
        'Series continuity',
        'Character memory'
      ],
      capabilities: [
        'Tracks what each character knows/doesn\'t know',
        'Maintains character emotional states',
        'Ensures characters evolve logically',
        'Prevents knowledge anachronisms',
        'Maintains series-wide continuity'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '3-6 seconds'
    }],

    // =========================================================================
    // WORLD-BUILDING AGENTS
    // =========================================================================

    ['lore-keeper', {
      role: 'lore-keeper',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Manages world history, mythology, and background lore',
      specializations: [
        'Lore creation',
        'Historical timelines',
        'Mythology development',
        'Cultural history',
        'Lore consistency'
      ],
      capabilities: [
        'Develops rich world history',
        'Creates compelling mythology',
        'Maintains lore consistency',
        'Tracks all historical events',
        'Ensures lore supports narrative'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '6-12 seconds'
    }],

    ['culture-designer', {
      role: 'culture-designer',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Creates cultural systems, traditions, and societal structures',
      specializations: [
        'Cultural systems',
        'Traditions and customs',
        'Social hierarchies',
        'Value systems',
        'Cultural evolution'
      ],
      capabilities: [
        'Designs coherent cultural systems',
        'Creates believable traditions',
        'Develops social structures',
        'Ensures cultural consistency',
        'Tracks cultural evolution'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '7-14 seconds'
    }],

    ['magic-system-architect', {
      role: 'magic-system-architect',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Designs internally consistent magic/power systems',
      specializations: [
        'Magic system design',
        'Power rules and limits',
        'Cost/consequence balance',
        'System evolution',
        'Consistency enforcement'
      ],
      capabilities: [
        'Creates balanced magic systems',
        'Defines clear rules and limitations',
        'Ensures system consistency',
        'Prevents deus ex machina',
        'Designs compelling costs/consequences'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '8-15 seconds'
    }],

    ['geography-expert', {
      role: 'geography-expert',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Maps locations and maintains spatial relationships',
      specializations: [
        'World mapping',
        'Spatial consistency',
        'Travel logistics',
        'Climate and terrain',
        'Location descriptions'
      ],
      capabilities: [
        'Creates detailed world maps',
        'Maintains spatial consistency',
        'Calculates realistic travel times',
        'Ensures geographic logic',
        'Generates vivid location descriptions'
      ],
      model: AIModel.GPT4O,
      priority: 6,
      estimatedDuration: '5-10 seconds'
    }],

    ['timeline-guardian', {
      role: 'timeline-guardian',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Maintains chronological consistency and timelines',
      specializations: [
        'Timeline management',
        'Chronological consistency',
        'Flashback integration',
        'Multi-timeline coordination',
        'Time travel logic'
      ],
      capabilities: [
        'Tracks all events chronologically',
        'Prevents timeline contradictions',
        'Manages flashbacks and flash-forwards',
        'Coordinates multiple timelines',
        'Ensures time travel consistency'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '4-8 seconds'
    }],

    ['technology-consultant', {
      role: 'technology-consultant',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Ensures technological consistency and realism',
      specializations: [
        'Tech level consistency',
        'Scientific accuracy',
        'Future tech extrapolation',
        'Tech evolution',
        'Technical jargon'
      ],
      capabilities: [
        'Maintains technology consistency',
        'Validates scientific accuracy',
        'Designs believable future tech',
        'Tracks technological evolution',
        'Generates accurate technical descriptions'
      ],
      model: AIModel.GPT4O,
      priority: 6,
      estimatedDuration: '5-10 seconds'
    }],

    ['economy-systems-designer', {
      role: 'economy-systems-designer',
      category: AgentCategory.WORLD_BUILDING,
      description: 'Designs economic systems and resource flows',
      specializations: [
        'Economic systems',
        'Resource management',
        'Trade networks',
        'Currency systems',
        'Economic realism'
      ],
      capabilities: [
        'Designs coherent economic systems',
        'Creates believable resource flows',
        'Develops trade relationships',
        'Ensures economic consistency',
        'Adds economic depth to worldbuilding'
      ],
      model: AIModel.GPT4O,
      priority: 5,
      estimatedDuration: '6-12 seconds'
    }],

    // =========================================================================
    // WRITING STYLE AGENTS
    // =========================================================================

    ['prose-stylist', {
      role: 'prose-stylist',
      category: AgentCategory.WRITING_STYLE,
      description: 'Crafts beautiful, genre-appropriate prose',
      specializations: [
        'Sentence-level craft',
        'Word choice optimization',
        'Imagery creation',
        'Genre-appropriate style',
        'Prose rhythm'
      ],
      capabilities: [
        'Generates beautiful prose',
        'Optimizes word choice',
        'Creates vivid imagery',
        'Matches genre conventions',
        'Maintains consistent prose quality'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '4-9 seconds'
    }],

    ['metaphor-crafter', {
      role: 'metaphor-crafter',
      category: AgentCategory.WRITING_STYLE,
      description: 'Creates fresh, powerful metaphors and similes',
      specializations: [
        'Metaphor creation',
        'Simile generation',
        'Figurative language',
        'Originality scoring',
        'Cultural appropriateness'
      ],
      capabilities: [
        'Creates original metaphors',
        'Avoids clichéd comparisons',
        'Ensures cultural sensitivity',
        'Scores metaphor originality',
        'Maintains metaphor consistency'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '3-7 seconds'
    }],

    ['sensory-detail-expert', {
      role: 'sensory-detail-expert',
      category: AgentCategory.WRITING_STYLE,
      description: 'Adds rich sensory descriptions (sight, sound, smell, touch, taste)',
      specializations: [
        'Multi-sensory descriptions',
        'Sensory balance',
        'Immersive details',
        'Sensory consistency',
        'Evocative imagery'
      ],
      capabilities: [
        'Adds vivid sensory details',
        'Balances all five senses',
        'Creates immersive scenes',
        'Ensures sensory consistency',
        'Avoids over-description'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '4-8 seconds'
    }],

    ['emotion-resonance-analyzer', {
      role: 'emotion-resonance-analyzer',
      category: AgentCategory.WRITING_STYLE,
      description: 'Analyzes and enhances emotional impact',
      specializations: [
        'Emotional impact analysis',
        'Reader empathy building',
        'Emotional authenticity',
        'Catharsis timing',
        'Emotional pacing'
      ],
      capabilities: [
        'Analyzes emotional resonance',
        'Enhances emotional authenticity',
        'Builds reader empathy',
        'Times emotional beats effectively',
        'Ensures emotional payoffs'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['show-dont-tell-enforcer', {
      role: 'show-dont-tell-enforcer',
      category: AgentCategory.WRITING_STYLE,
      description: 'Converts telling to showing for more engaging prose',
      specializations: [
        'Show vs tell identification',
        'Action-based revelation',
        'Dialogue-driven exposition',
        'Sensory showing',
        'Subtlety optimization'
      ],
      capabilities: [
        'Identifies instances of telling',
        'Converts telling to showing',
        'Uses action and dialogue for revelation',
        'Maintains optimal show/tell balance',
        'Improves reader engagement'
      ],
      model: AIModel.CLAUDE_SONNET_37,
      priority: 8,
      estimatedDuration: '3-7 seconds'
    }],

    ['literary-device-specialist', {
      role: 'literary-device-specialist',
      category: AgentCategory.WRITING_STYLE,
      description: 'Applies appropriate literary devices and techniques',
      specializations: [
        'Literary device application',
        'Rhetorical techniques',
        'Structural devices',
        'Narrative techniques',
        'Device appropriateness'
      ],
      capabilities: [
        'Identifies opportunities for literary devices',
        'Applies devices appropriately',
        'Avoids overuse or misuse',
        'Enhances prose with technique',
        'Maintains genre appropriateness'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 6,
      estimatedDuration: '4-8 seconds'
    }],

    ['pov-consistency-checker', {
      role: 'pov-consistency-checker',
      category: AgentCategory.WRITING_STYLE,
      description: 'Ensures point-of-view consistency and appropriateness',
      specializations: [
        'POV validation',
        'Head-hopping detection',
        'Perspective consistency',
        'POV-appropriate details',
        'Voice alignment'
      ],
      capabilities: [
        'Validates POV consistency',
        'Detects inappropriate head-hopping',
        'Ensures perspective alignment',
        'Maintains POV limitations',
        'Corrects POV violations'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '2-5 seconds'
    }],

    // =========================================================================
    // RESEARCH AGENTS
    // =========================================================================

    ['historical-researcher', {
      role: 'historical-researcher',
      category: AgentCategory.RESEARCH,
      description: 'Researches historical periods for accuracy',
      specializations: [
        'Historical research',
        'Period accuracy',
        'Historical events',
        'Era-appropriate details',
        'Anachronism prevention'
      ],
      capabilities: [
        'Researches historical periods',
        'Validates historical accuracy',
        'Provides period-appropriate details',
        'Prevents anachronisms',
        'Enriches historical context'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '10-20 seconds (LearningAgent delegation)'
    }],

    ['technical-consultant', {
      role: 'technical-consultant',
      category: AgentCategory.RESEARCH,
      description: 'Ensures technical accuracy for specialized topics',
      specializations: [
        'Technical research',
        'Subject matter expertise',
        'Scientific accuracy',
        'Professional authenticity',
        'Jargon validation'
      ],
      capabilities: [
        'Researches technical topics',
        'Validates technical accuracy',
        'Provides expert-level details',
        'Ensures authentic jargon use',
        'Prevents technical errors'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '10-20 seconds (LearningAgent delegation)'
    }],

    ['cultural-sensitivity-advisor', {
      role: 'cultural-sensitivity-advisor',
      category: AgentCategory.RESEARCH,
      description: 'Ensures cultural authenticity and sensitivity',
      specializations: [
        'Cultural research',
        'Sensitivity review',
        'Stereotype avoidance',
        'Authentic representation',
        'Cultural nuance'
      ],
      capabilities: [
        'Reviews for cultural sensitivity',
        'Validates cultural authenticity',
        'Identifies stereotypes',
        'Ensures respectful representation',
        'Provides cultural context'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '8-15 seconds'
    }],

    ['language-consultant', {
      role: 'language-consultant',
      category: AgentCategory.RESEARCH,
      description: 'Provides authentic dialogue for non-English speakers',
      specializations: [
        'Multilingual dialogue',
        'Dialect authenticity',
        'Translation accuracy',
        'Code-switching',
        'Linguistic realism'
      ],
      capabilities: [
        'Creates authentic multilingual dialogue',
        'Validates dialect accuracy',
        'Ensures proper code-switching',
        'Provides translation context',
        'Maintains linguistic consistency'
      ],
      model: AIModel.GPT4O,
      priority: 6,
      estimatedDuration: '5-10 seconds'
    }],

    ['fact-checker', {
      role: 'fact-checker',
      category: AgentCategory.RESEARCH,
      description: 'Verifies factual claims in narrative',
      specializations: [
        'Fact verification',
        'Source validation',
        'Accuracy checking',
        'Error detection',
        'Citation management'
      ],
      capabilities: [
        'Verifies all factual claims',
        'Identifies factual errors',
        'Provides source citations',
        'Ensures overall accuracy',
        'Prevents misinformation'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '8-15 seconds (LearningAgent delegation)'
    }],

    ['subject-matter-expert', {
      role: 'subject-matter-expert',
      category: AgentCategory.RESEARCH,
      description: 'Provides deep expertise on specific subjects',
      specializations: [
        'Domain expertise',
        'Specialized knowledge',
        'Industry authenticity',
        'Professional accuracy',
        'Expert-level details'
      ],
      capabilities: [
        'Provides expert-level knowledge',
        'Ensures professional authenticity',
        'Adds specialized details',
        'Validates domain-specific content',
        'Enriches narrative with expertise'
      ],
      model: AIModel.GPT4O,
      priority: 6,
      estimatedDuration: '10-20 seconds (LearningAgent delegation)'
    }],

    // =========================================================================
    // QUALITY ASSURANCE AGENTS
    // =========================================================================

    ['continuity-checker', {
      role: 'continuity-checker',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Cross-references all story elements for consistency',
      specializations: [
        'Continuity validation',
        'Cross-referencing',
        'Error detection',
        'Consistency scoring',
        'Series-wide checking'
      ],
      capabilities: [
        'Validates all continuity elements',
        'Cross-references characters, locations, events',
        'Detects contradictions',
        'Scores consistency (target: 98%+)',
        'Maintains series-wide continuity'
      ],
      model: AIModel.GPT4O,
      priority: 9,
      estimatedDuration: '5-10 seconds'
    }],

    ['plot-hole-detector', {
      role: 'plot-hole-detector',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Identifies logical inconsistencies and plot holes',
      specializations: [
        'Logic validation',
        'Plot hole detection',
        'Causal chain analysis',
        'Motivation consistency',
        'Problem identification'
      ],
      capabilities: [
        'Identifies plot holes',
        'Validates logical consistency',
        'Checks cause-effect relationships',
        'Ensures motivation alignment',
        'Suggests plot hole fixes'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '6-12 seconds'
    }],

    ['redundancy-eliminator', {
      role: 'redundancy-eliminator',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Removes repetitive content and unnecessary duplication',
      specializations: [
        'Redundancy detection',
        'Repetition analysis',
        'Efficiency optimization',
        'Conciseness improvement',
        'Information density'
      ],
      capabilities: [
        'Detects redundant content',
        'Identifies unnecessary repetition',
        'Suggests concise alternatives',
        'Optimizes information density',
        'Maintains narrative flow'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '3-6 seconds'
    }],

    ['cliche-detector', {
      role: 'cliche-detector',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Flags overused tropes and clichés',
      specializations: [
        'Cliché detection',
        'Trope analysis',
        'Originality scoring',
        'Fresh alternatives',
        'Genre-aware detection'
      ],
      capabilities: [
        'Identifies clichés and overused tropes',
        'Scores originality',
        'Suggests fresh alternatives',
        'Balances familiar and novel',
        'Maintains genre expectations'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['originality-assessor', {
      role: 'originality-assessor',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Measures creative uniqueness and innovation',
      specializations: [
        'Originality measurement',
        'Innovation scoring',
        'Derivative detection',
        'Creative assessment',
        'Uniqueness validation'
      ],
      capabilities: [
        'Scores overall originality',
        'Identifies derivative elements',
        'Measures creative innovation',
        'Validates uniqueness',
        'Suggests originality improvements'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '6-12 seconds'
    }],

    ['grammar-perfectionist', {
      role: 'grammar-perfectionist',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Ensures flawless grammar, spelling, and syntax',
      specializations: [
        'Grammar validation',
        'Spelling correction',
        'Syntax optimization',
        'Punctuation accuracy',
        'Style guide adherence'
      ],
      capabilities: [
        'Validates grammar and syntax',
        'Corrects spelling errors',
        'Optimizes punctuation',
        'Ensures style guide compliance',
        'Maintains technical excellence'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '2-5 seconds'
    }],

    ['consistency-validator', {
      role: 'consistency-validator',
      category: AgentCategory.QUALITY_ASSURANCE,
      description: 'Validates consistency across all narrative elements',
      specializations: [
        'Multi-element consistency',
        'Cross-validation',
        'Pattern detection',
        'Anomaly identification',
        'Holistic consistency'
      ],
      capabilities: [
        'Validates all consistency dimensions',
        'Cross-checks multiple elements',
        'Detects patterns and anomalies',
        'Provides consistency scores',
        'Ensures holistic coherence'
      ],
      model: AIModel.GPT4O,
      priority: 9,
      estimatedDuration: '5-10 seconds'
    }],

    // =========================================================================
    // ANTI-AI-DETECTION AGENTS
    // =========================================================================

    ['human-imperfection-injector', {
      role: 'human-imperfection-injector',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Adds natural writing quirks and imperfections',
      specializations: [
        'Deliberate imperfections',
        'Natural quirks',
        'Sentence fragments',
        'Strategic run-ons',
        'Human variance'
      ],
      capabilities: [
        'Injects natural imperfections',
        'Adds strategic sentence fragments',
        'Creates occasional run-ons',
        'Maintains natural variance',
        'Reduces AI detection signals'
      ],
      model: AIModel.MULTI_MODEL_ENSEMBLE,
      priority: 9,
      estimatedDuration: '4-8 seconds'
    }],

    ['vocabulary-diversifier', {
      role: 'vocabulary-diversifier',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Prevents AI-typical word patterns',
      specializations: [
        'Vocabulary variation',
        'AI word avoidance',
        'Synonym diversity',
        'Natural word choice',
        'Pattern breaking'
      ],
      capabilities: [
        'Identifies AI-typical words',
        'Replaces with natural alternatives',
        'Diversifies vocabulary',
        'Maintains appropriate reading level',
        'Reduces detection probability'
      ],
      model: AIModel.MULTI_MODEL_ENSEMBLE,
      priority: 9,
      estimatedDuration: '3-6 seconds'
    }],

    ['sentence-structure-variator', {
      role: 'sentence-structure-variator',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Breaks uniform sentence patterns',
      specializations: [
        'Structure variation',
        'Length diversity',
        'Clause mixing',
        'Pattern disruption',
        'Natural flow'
      ],
      capabilities: [
        'Varies sentence structures',
        'Mixes simple, compound, complex',
        'Diversifies sentence length',
        'Breaks AI patterns',
        'Creates natural rhythm'
      ],
      model: AIModel.MULTI_MODEL_ENSEMBLE,
      priority: 9,
      estimatedDuration: '3-7 seconds'
    }],

    ['rhythm-naturalizer', {
      role: 'rhythm-naturalizer',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Creates human reading flow and cadence',
      specializations: [
        'Reading rhythm',
        'Cadence optimization',
        'Flow naturalization',
        'Pause placement',
        'Breath points'
      ],
      capabilities: [
        'Analyzes reading rhythm',
        'Optimizes natural cadence',
        'Places strategic pauses',
        'Creates breath points',
        'Ensures human-like flow'
      ],
      model: AIModel.MULTI_MODEL_ENSEMBLE,
      priority: 8,
      estimatedDuration: '4-8 seconds'
    }],

    ['voice-authenticator', {
      role: 'voice-authenticator',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Ensures author\'s unique voice shines through',
      specializations: [
        'Voice fingerprinting',
        'Author style preservation',
        'Unique voice elements',
        'Personality injection',
        'Authenticity validation'
      ],
      capabilities: [
        'Analyzes author\'s unique voice',
        'Preserves personal style',
        'Injects personality quirks',
        'Validates authenticity',
        'Maintains voice consistency'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 9,
      estimatedDuration: '5-10 seconds'
    }],

    ['ai-detection-scorer', {
      role: 'ai-detection-scorer',
      category: AgentCategory.ANTI_AI_DETECTION,
      description: 'Scores content against AI detection algorithms',
      specializations: [
        'Detection probability scoring',
        'Pattern analysis',
        'Risk identification',
        'Improvement suggestions',
        'Multi-detector validation'
      ],
      capabilities: [
        'Scores AI detection probability',
        'Analyzes detection patterns',
        'Identifies high-risk sections',
        'Suggests improvements',
        'Targets <5% detection rate'
      ],
      model: AIModel.MULTI_MODEL_ENSEMBLE,
      priority: 10,
      estimatedDuration: '6-12 seconds'
    }],

    // =========================================================================
    // GENRE-SPECIFIC AGENTS
    // =========================================================================

    ['mystery-clue-placer', {
      role: 'mystery-clue-placer',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Mystery/thriller clue management and red herrings',
      specializations: [
        'Clue placement',
        'Red herrings',
        'Fair play mystery',
        'Revelation timing',
        'Mystery structure'
      ],
      capabilities: [
        'Places clues strategically',
        'Creates effective red herrings',
        'Ensures fair play mystery',
        'Times revelations optimally',
        'Maintains mystery tension'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['romance-tension-builder', {
      role: 'romance-tension-builder',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Romantic arc pacing and relationship development',
      specializations: [
        'Romance arc structure',
        'Chemistry building',
        'Conflict timing',
        'Emotional beats',
        'HEA/HFN delivery'
      ],
      capabilities: [
        'Structures romance arcs',
        'Builds believable chemistry',
        'Times relationship conflicts',
        'Delivers emotional beats',
        'Ensures satisfying endings'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['scifi-worldbuilding-tech', {
      role: 'scifi-worldbuilding-tech',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Hard sci-fi technical consistency and world-building',
      specializations: [
        'Scientific accuracy',
        'Future tech extrapolation',
        'Technical consistency',
        'Physics validation',
        'Tech implications'
      ],
      capabilities: [
        'Ensures scientific accuracy',
        'Designs believable future tech',
        'Maintains technical consistency',
        'Validates physics and science',
        'Explores tech implications'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '7-14 seconds'
    }],

    ['fantasy-magic-logic', {
      role: 'fantasy-magic-logic',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Fantasy magic system rules and consistency',
      specializations: [
        'Magic system design',
        'Power limits',
        'Cost/consequence',
        'System consistency',
        'Magical worldbuilding'
      ],
      capabilities: [
        'Designs coherent magic systems',
        'Defines clear limitations',
        'Balances costs and benefits',
        'Ensures magical consistency',
        'Prevents magical deus ex machina'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '7-14 seconds'
    }],

    ['horror-atmosphere-crafter', {
      role: 'horror-atmosphere-crafter',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Horror mood, atmosphere, and fear escalation',
      specializations: [
        'Atmosphere building',
        'Dread pacing',
        'Fear escalation',
        'Horror beats',
        'Psychological terror'
      ],
      capabilities: [
        'Builds oppressive atmosphere',
        'Paces dread effectively',
        'Escalates fear systematically',
        'Times horror beats',
        'Creates psychological impact'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['thriller-suspense-builder', {
      role: 'thriller-suspense-builder',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Thriller pacing, suspense, and plot twists',
      specializations: [
        'Suspense building',
        'Pacing acceleration',
        'Plot twist design',
        'Cliffhangers',
        'Tension maintenance'
      ],
      capabilities: [
        'Builds mounting suspense',
        'Accelerates pacing',
        'Designs shocking twists',
        'Creates effective cliffhangers',
        'Maintains relentless tension'
      ],
      model: AIModel.GPT4O,
      priority: 8,
      estimatedDuration: '5-10 seconds'
    }],

    ['literary-fiction-depth-analyzer', {
      role: 'literary-fiction-depth-analyzer',
      category: AgentCategory.GENRE_SPECIFIC,
      description: 'Literary fiction depth, themes, and symbolism',
      specializations: [
        'Thematic depth',
        'Symbolic layering',
        'Literary craft',
        'Character complexity',
        'Philosophical exploration'
      ],
      capabilities: [
        'Adds thematic complexity',
        'Layers symbolic meaning',
        'Enhances literary craft',
        'Deepens character psychology',
        'Explores philosophical themes'
      ],
      model: AIModel.CLAUDE_OPUS_4,
      priority: 7,
      estimatedDuration: '8-15 seconds'
    }],

    // =========================================================================
    // FORMAT-SPECIFIC AGENTS
    // =========================================================================

    ['screenplay-formatter', {
      role: 'screenplay-formatter',
      category: AgentCategory.FORMAT_SPECIFIC,
      description: 'Industry-standard screenplay formatting and structure',
      specializations: [
        'Screenplay format',
        'Visual storytelling',
        'Scene descriptions',
        'Dialogue formatting',
        'Industry standards'
      ],
      capabilities: [
        'Formats to industry standards',
        'Optimizes visual storytelling',
        'Writes effective scene descriptions',
        'Formats dialogue properly',
        'Ensures professional presentation'
      ],
      model: AIModel.GPT4O,
      priority: 9,
      estimatedDuration: '4-8 seconds'
    }],

    ['youtube-script-optimizer', {
      role: 'youtube-script-optimizer',
      category: AgentCategory.FORMAT_SPECIFIC,
      description: 'YouTube script optimization for retention and engagement',
      specializations: [
        'Hook optimization',
        'Retention tactics',
        'Pattern interrupts',
        'CTA placement',
        'B-roll suggestions'
      ],
      capabilities: [
        'Optimizes opening hooks',
        'Implements retention tactics',
        'Places pattern interrupts',
        'Positions CTAs effectively',
        'Suggests B-roll moments'
      ],
      model: AIModel.GEMINI_20_FLASH,
      priority: 8,
      estimatedDuration: '3-6 seconds'
    }],

    ['stage-play-director', {
      role: 'stage-play-director',
      category: AgentCategory.FORMAT_SPECIFIC,
      description: 'Theatrical formatting and stage considerations',
      specializations: [
        'Theatrical format',
        'Stage directions',
        'Blocking',
        'Set design considerations',
        'Performance practicality'
      ],
      capabilities: [
        'Formats for theater',
        'Writes clear stage directions',
        'Considers blocking and movement',
        'Designs practical sets',
        'Ensures performability'
      ],
      model: AIModel.GPT4O,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['comic-book-panelist', {
      role: 'comic-book-panelist',
      category: AgentCategory.FORMAT_SPECIFIC,
      description: 'Comic book script format and visual storytelling',
      specializations: [
        'Panel descriptions',
        'Visual storytelling',
        'Dialogue brevity',
        'Pacing through panels',
        'Artist collaboration'
      ],
      capabilities: [
        'Writes panel descriptions',
        'Optimizes visual storytelling',
        'Keeps dialogue concise',
        'Paces through panel sequences',
        'Facilitates artist collaboration'
      ],
      model: AIModel.GEMINI_20_FLASH,
      priority: 7,
      estimatedDuration: '4-8 seconds'
    }],

    ['podcast-dialogue-flow', {
      role: 'podcast-dialogue-flow',
      category: AgentCategory.FORMAT_SPECIFIC,
      description: 'Podcast script with audio-first conversational flow',
      specializations: [
        'Audio-first writing',
        'Conversational flow',
        'Listener engagement',
        'Segment structure',
        'Audio cues'
      ],
      capabilities: [
        'Writes for audio medium',
        'Creates natural conversation',
        'Engages listeners',
        'Structures segments',
        'Includes audio cues'
      ],
      model: AIModel.GEMINI_20_FLASH,
      priority: 7,
      estimatedDuration: '3-6 seconds'
    }]
  ]);

  /**
   * Get agent definition by role
   */
  static getAgent(role: AgentRole): AgentDefinition | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all agents in a category
   */
  static getAgentsByCategory(category: AgentCategory): AgentDefinition[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.category === category
    );
  }

  /**
   * Get all agents
   */
  static getAllAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by priority (descending)
   */
  static getAgentsByPriority(): AgentDefinition[] {
    return Array.from(this.agents.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get recommended agents for a writing task
   */
  static getRecommendedAgentsForTask(taskType: string, genre?: string): AgentDefinition[] {
    const recommended: AgentDefinition[] = [];

    // Always include orchestration
    const director = this.agents.get('director');
    const synthesis = this.agents.get('synthesis-agent');
    if (director) recommended.push(director);
    if (synthesis) recommended.push(synthesis);

    // Task-specific recommendations
    switch (taskType) {
      case 'generate-beat':
      case 'generate-scene':
        recommended.push(
          ...this.getRequiredAgents(['prose-stylist', 'sensory-detail-expert', 'continuity-checker'])
        );
        break;

      case 'generate-chapter':
        recommended.push(
          ...this.getRequiredAgents([
            'plot-architect',
            'prose-stylist',
            'dialogue-specialist',
            'continuity-checker',
            'pacing-optimizer',
            'human-imperfection-injector',
            'ai-detection-scorer'
          ])
        );
        break;

      case 'create-character':
        recommended.push(
          ...this.getRequiredAgents([
            'character-psychologist',
            'dialogue-specialist',
            'arc-designer',
            'voice-consistency-guard'
          ])
        );
        break;

      case 'refine-dialogue':
        recommended.push(
          ...this.getRequiredAgents([
            'dialogue-specialist',
            'voice-consistency-guard',
            'character-psychologist'
          ])
        );
        break;

      case 'humanize-content':
        recommended.push(
          ...this.getRequiredAgents([
            'human-imperfection-injector',
            'vocabulary-diversifier',
            'sentence-structure-variator',
            'rhythm-naturalizer',
            'voice-authenticator',
            'ai-detection-scorer'
          ])
        );
        break;

      case 'check-continuity':
        recommended.push(
          ...this.getRequiredAgents([
            'continuity-checker',
            'plot-hole-detector',
            'consistency-validator',
            'timeline-guardian'
          ])
        );
        break;
    }

    // Genre-specific additions
    if (genre) {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes('mystery') || genreLower.includes('thriller')) {
        const agent = this.agents.get('mystery-clue-placer');
        if (agent) recommended.push(agent);
      }
      if (genreLower.includes('romance')) {
        const agent = this.agents.get('romance-tension-builder');
        if (agent) recommended.push(agent);
      }
      if (genreLower.includes('fantasy')) {
        const agent = this.agents.get('fantasy-magic-logic');
        if (agent) recommended.push(agent);
      }
      if (genreLower.includes('sci-fi') || genreLower.includes('science fiction')) {
        const agent = this.agents.get('scifi-worldbuilding-tech');
        if (agent) recommended.push(agent);
      }
      if (genreLower.includes('horror')) {
        const agent = this.agents.get('horror-atmosphere-crafter');
        if (agent) recommended.push(agent);
      }
    }

    return recommended;
  }

  /**
   * Get required agents by roles
   */
  private static getRequiredAgents(roles: AgentRole[]): AgentDefinition[] {
    return roles
      .map(role => this.agents.get(role))
      .filter((agent): agent is AgentDefinition => agent !== undefined);
  }

  /**
   * Get total agent count
   */
  static getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get agent count by category
   */
  static getAgentCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const agent of this.agents.values()) {
      const category = agent.category;
      counts[category] = (counts[category] || 0) + 1;
    }

    return counts;
  }
}
