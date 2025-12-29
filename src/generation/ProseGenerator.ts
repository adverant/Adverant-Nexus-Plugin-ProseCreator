/**
 * NexusProseCreator - Prose Generator (Main Orchestrator)
 *
 * Main orchestration engine for generating undetectable, consistent prose
 * Integrates: Context Injection, Multi-Agent Generation, Anti-AI-Detection,
 *             Continuity Validation, Voice Consistency
 */

import { PromptBuilder } from './PromptBuilder';
import { AntiAIDetection } from './AntiAIDetection';
import { StyleAnalyzer } from './StyleAnalyzer';
import { VoiceConsistency } from './VoiceConsistency';
import { ContinuityValidator } from './ContinuityValidator';

import {
  GenerationParams,
  GeneratedBeat,
  GeneratedChapter,
  BeatBlueprint,
  ChapterBlueprint,
  InjectedContext,
  GenerationOptions,
  PerformanceMetrics,
  GenerationError,
  RetryStrategy,
} from './types';

/**
 * Interface for Context Injector (to be implemented by Agent 7)
 */
interface ContextInjector {
  injectContextForBeat(params: {
    project_id: string;
    chapter_number: number;
    beat_number: number;
    blueprint: BeatBlueprint;
  }): Promise<InjectedContext>;
}

/**
 * Interface for Agent Orchestrator (to be implemented by Agent 6)
 */
interface AgentOrchestrator {
  orchestrate(params: {
    task: string;
    context: Record<string, any>;
    maxAgents?: number;
    timeout?: number;
  }): Promise<{
    content: string;
    agents: string[];
    confidence: number;
    metadata: Record<string, any>;
  }>;
}

/**
 * Interface for Memory Manager
 */
interface MemoryManager {
  storeBeat(params: {
    project_id: string;
    chapter_number: number;
    beat_number: number;
    content: string;
    word_count: number;
    ai_detection_score: number;
    continuity_score: number;
    [key: string]: any;
  }): Promise<void>;
}

export class ProseGenerator {
  private readonly promptBuilder: PromptBuilder;
  private readonly antiAI: AntiAIDetection;
  private readonly styleAnalyzer: StyleAnalyzer;
  private readonly voiceConsistency: VoiceConsistency;
  private readonly continuityValidator: ContinuityValidator;

  private readonly contextInjector: ContextInjector;
  private readonly orchestrator: AgentOrchestrator;
  private readonly memoryManager: MemoryManager;

  private readonly defaultOptions: GenerationOptions = {
    temperature: 0.7,
    max_tokens: 4000,
    stream: false,
    retry_on_failure: true,
    max_retries: 3,
    validate_continuity: true,
    apply_humanization: true,
    match_style: true,
  };

  private readonly retryStrategy: RetryStrategy = {
    max_attempts: 3,
    backoff_ms: 1000,
    backoff_multiplier: 2,
  };

  constructor(
    contextInjector: ContextInjector,
    orchestrator: AgentOrchestrator,
    memoryManager: MemoryManager
  ) {
    this.contextInjector = contextInjector;
    this.orchestrator = orchestrator;
    this.memoryManager = memoryManager;

    // Initialize components
    this.promptBuilder = new PromptBuilder();
    this.antiAI = new AntiAIDetection();
    this.styleAnalyzer = new StyleAnalyzer();
    this.voiceConsistency = new VoiceConsistency();
    this.continuityValidator = new ContinuityValidator();
  }

  /**
   * Generate a single beat with full validation and humanization
   */
  async generateBeat(params: GenerationParams): Promise<GeneratedBeat> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...params.options };

    let retries = 0;
    let lastError: GenerationError | null = null;

    while (retries <= this.retryStrategy.max_attempts) {
      try {
        // STEP 1: Inject Context (retrieve from GraphRAG)
        const contextStart = Date.now();
        const context = await this.contextInjector.injectContextForBeat({
          project_id: params.project_id,
          chapter_number: params.chapter_number,
          beat_number: params.beat_number,
          blueprint: params.blueprint,
        });
        const contextRetrievalMs = Date.now() - contextStart;

        // STEP 2: Build Prompt
        const promptComponents = this.promptBuilder.buildBeatPrompt(
          params.blueprint,
          context
        );
        const fullPrompt = this.promptBuilder.combinePromptComponents(promptComponents);

        // STEP 3: Generate with Multiple Agents
        const genStart = Date.now();
        const rawResult = await this.orchestrator.orchestrate({
          task: 'generate beat',
          context: {
            prompt: fullPrompt,
            blueprint: params.blueprint,
            context,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
          },
          maxAgents: 8, // Use multiple specialized agents
          timeout: 60000, // 60 second timeout
        });
        const generationTimeMs = Date.now() - genStart;

        let content = rawResult.content;
        let aiDetectionScore = 100; // Start pessimistic
        let continuityScore = 0;

        // STEP 4: Apply Anti-AI-Detection Humanization
        if (options.apply_humanization) {
          const humanizeStart = Date.now();
          content = await this.antiAI.humanize(content, context.styleProfile);
          const humanizationTimeMs = Date.now() - humanizeStart;

          // Assess AI detection score
          aiDetectionScore = await this.antiAI.assessScore(content);

          console.log(
            `[ProseGenerator] Humanization complete: ${aiDetectionScore.toFixed(1)}% detection score (${humanizationTimeMs}ms)`
          );
        }

        // STEP 5: Match Style Profile (if enabled)
        if (options.match_style && context.styleProfile) {
          const styleStart = Date.now();
          content = await this.styleAnalyzer.matchStyle(content, context.styleProfile);
          console.log(`[ProseGenerator] Style matching complete (${Date.now() - styleStart}ms)`);
        }

        // STEP 6: Validate Continuity
        let continuityCheck;
        if (options.validate_continuity) {
          const validationStart = Date.now();
          continuityCheck = await this.continuityValidator.validate({
            content,
            context,
            blueprint: params.blueprint,
          });
          const validationTimeMs = Date.now() - validationStart;
          continuityScore = continuityCheck.score;

          console.log(
            `[ProseGenerator] Continuity validation: ${continuityScore}% (${validationTimeMs}ms)`
          );

          // STEP 7: Handle Continuity Issues
          if (continuityCheck.issues.length > 0) {
            const criticalIssues = continuityCheck.issues.filter(
              (i) => i.severity === 'critical' || i.severity === 'high'
            );

            if (criticalIssues.length > 0 && retries < this.retryStrategy.max_attempts) {
              // Regenerate with corrections
              console.warn(
                `[ProseGenerator] ${criticalIssues.length} critical continuity issues detected. Retrying...`
              );

              lastError = {
                code: 'CONTINUITY_FAILURE',
                message: `Continuity issues: ${criticalIssues.map((i) => i.message).join('; ')}`,
                retry_possible: true,
                context: { issues: criticalIssues },
              };

              retries++;
              await this.sleep(this.retryStrategy.backoff_ms * Math.pow(this.retryStrategy.backoff_multiplier, retries - 1));
              continue; // Retry generation
            }
          }
        }

        // STEP 8: Check AI Detection Score
        if (aiDetectionScore > 10) {
          console.warn(
            `[ProseGenerator] AI detection score (${aiDetectionScore.toFixed(1)}%) exceeds target (<5%). Content may be detectable.`
          );

          // Optionally retry humanization
          if (retries < this.retryStrategy.max_attempts) {
            lastError = {
              code: 'HIGH_AI_DETECTION',
              message: `AI detection score too high: ${aiDetectionScore.toFixed(1)}%`,
              retry_possible: true,
            };

            retries++;
            await this.sleep(this.retryStrategy.backoff_ms * Math.pow(this.retryStrategy.backoff_multiplier, retries - 1));
            continue; // Retry generation
          }
        }

        // STEP 9: Store in Memory
        await this.memoryManager.storeBeat({
          project_id: params.project_id,
          chapter_number: params.chapter_number,
          beat_number: params.beat_number,
          content,
          word_count: this.countWords(content),
          ai_detection_score: aiDetectionScore,
          continuity_score: continuityScore,
          blueprint: params.blueprint,
        });

        // STEP 10: Return Result
        const totalTimeMs = Date.now() - startTime;

        const result: GeneratedBeat = {
          content,
          word_count: this.countWords(content),
          ai_detection_score: aiDetectionScore,
          continuity_score: continuityScore,
          generation_metadata: {
            agents_used: rawResult.agents,
            retries,
            timestamp: new Date(),
            model_used: rawResult.metadata.model_used || 'multi-agent-ensemble',
            latency_ms: totalTimeMs,
            cost_estimate: this.estimateCost(content, rawResult.agents.length),
          },
        };

        // Log metrics
        const metrics: PerformanceMetrics = {
          generation_time_ms: generationTimeMs,
          context_retrieval_ms: contextRetrievalMs,
          validation_time_ms: 0,
          humanization_time_ms: 0,
          total_time_ms: totalTimeMs,
          tokens_used: Math.ceil(content.length / 4),
          cost_estimate: result.generation_metadata.cost_estimate || 0,
        };

        console.log(`[ProseGenerator] Beat generated successfully:`, {
          word_count: result.word_count,
          ai_detection: `${aiDetectionScore.toFixed(1)}%`,
          continuity: `${continuityScore}%`,
          total_time: `${totalTimeMs}ms`,
          retries,
        });

        return result;
      } catch (error) {
        lastError = {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          retry_possible: retries < this.retryStrategy.max_attempts,
          context: { error },
        };

        console.error(`[ProseGenerator] Generation attempt ${retries + 1} failed:`, error);

        if (!options.retry_on_failure || retries >= this.retryStrategy.max_attempts) {
          throw new Error(
            `Beat generation failed after ${retries + 1} attempts: ${lastError.message}`
          );
        }

        retries++;
        await this.sleep(
          this.retryStrategy.backoff_ms *
            Math.pow(this.retryStrategy.backoff_multiplier, retries - 1)
        );
      }
    }

    // If we get here, all retries failed
    throw new Error(
      `Beat generation failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Generate entire chapter (all beats sequentially)
   */
  async generateChapter(params: {
    project_id: string;
    chapter_number: number;
    blueprint: ChapterBlueprint;
    options?: GenerationOptions;
  }): Promise<GeneratedChapter> {
    const startTime = Date.now();
    console.log(
      `[ProseGenerator] Starting chapter generation: Chapter ${params.chapter_number} (${params.blueprint.beats.length} beats)`
    );

    const beats: GeneratedBeat[] = [];
    const options = { ...this.defaultOptions, ...params.options };

    // Generate beats sequentially for continuity
    for (const beatBlueprint of params.blueprint.beats) {
      console.log(
        `[ProseGenerator] Generating beat ${beatBlueprint.beat_number}/${params.blueprint.beats.length}...`
      );

      try {
        const beat = await this.generateBeat({
          project_id: params.project_id,
          chapter_number: params.chapter_number,
          beat_number: beatBlueprint.beat_number,
          blueprint: beatBlueprint,
          options,
        });

        beats.push(beat);

        console.log(
          `[ProseGenerator] Beat ${beatBlueprint.beat_number} complete: ${beat.word_count} words, ${beat.ai_detection_score.toFixed(1)}% detection`
        );
      } catch (error) {
        console.error(
          `[ProseGenerator] Failed to generate beat ${beatBlueprint.beat_number}:`,
          error
        );
        throw new Error(
          `Chapter generation failed at beat ${beatBlueprint.beat_number}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const totalWordCount = beats.reduce((sum, b) => sum + b.word_count, 0);
    const avgAIDetection =
      beats.reduce((sum, b) => sum + b.ai_detection_score, 0) / beats.length;
    const avgContinuity =
      beats.reduce((sum, b) => sum + b.continuity_score, 0) / beats.length;

    const totalTimeMs = Date.now() - startTime;

    const result: GeneratedChapter = {
      chapter_number: params.chapter_number,
      beats,
      total_word_count: totalWordCount,
      average_ai_detection_score: avgAIDetection,
      average_continuity_score: avgContinuity,
    };

    console.log(`[ProseGenerator] Chapter ${params.chapter_number} complete:`, {
      total_beats: beats.length,
      total_words: totalWordCount,
      avg_ai_detection: `${avgAIDetection.toFixed(1)}%`,
      avg_continuity: `${avgContinuity.toFixed(1)}%`,
      total_time: `${(totalTimeMs / 1000).toFixed(1)}s`,
    });

    return result;
  }

  /**
   * Regenerate beat with specific corrections
   */
  private async regenerateWithCorrections(
    params: GenerationParams,
    continuityIssues: any[]
  ): Promise<GeneratedBeat> {
    console.log(`[ProseGenerator] Regenerating with corrections for continuity issues...`);

    // Add corrections to context
    const correctionInstructions = continuityIssues
      .map((issue) => `- ${issue.message}: ${issue.suggestion}`)
      .join('\n');

    // Modify blueprint to include corrections
    const modifiedBlueprint = {
      ...params.blueprint,
      description: `${params.blueprint.description}\n\nCORRECTIONS NEEDED:\n${correctionInstructions}`,
    };

    // Regenerate
    return this.generateBeat({
      ...params,
      blueprint: modifiedBlueprint,
    });
  }

  // ====================================================================
  // HELPER METHODS
  // ====================================================================

  private countWords(text: string): number {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  private estimateCost(content: string, agentCount: number): number {
    // Rough cost estimate based on tokens and agents
    const tokens = Math.ceil(content.length / 4);
    const inputTokens = tokens * 2; // Approximate input
    const outputTokens = tokens;

    // Assuming GPT-4o pricing: $2.50/1M input, $10/1M output
    const inputCost = (inputTokens / 1_000_000) * 2.5;
    const outputCost = (outputTokens / 1_000_000) * 10.0;

    // Multiply by agent count (multiple models called)
    return (inputCost + outputCost) * agentCount;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate character voice in dialogue (convenience method)
   */
  async validateVoice(params: {
    character_name: string;
    dialogue: string;
    context: any;
  }): Promise<any> {
    return this.voiceConsistency.validateCharacterVoice(params);
  }

  /**
   * Adjust dialogue to match character voice (convenience method)
   */
  async adjustDialogue(dialogue: string, profile: any): Promise<string> {
    return this.voiceConsistency.adjustDialogue(dialogue, profile);
  }

  /**
   * Analyze existing writing sample for style (convenience method)
   */
  async analyzeStyle(sample: string): Promise<any> {
    return this.styleAnalyzer.analyzeExistingSample(sample);
  }

  /**
   * Get humanization metrics for content (convenience method)
   */
  async getHumanizationMetrics(content: string): Promise<any> {
    return this.antiAI.calculateMetrics(content);
  }

  /**
   * Health check for generator
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    timestamp: Date;
  }> {
    const components: Record<string, boolean> = {
      contextInjector: !!this.contextInjector,
      orchestrator: !!this.orchestrator,
      memoryManager: !!this.memoryManager,
      promptBuilder: !!this.promptBuilder,
      antiAI: !!this.antiAI,
      styleAnalyzer: !!this.styleAnalyzer,
      voiceConsistency: !!this.voiceConsistency,
      continuityValidator: !!this.continuityValidator,
    };

    const allHealthy = Object.values(components).every((v) => v);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      components,
      timestamp: new Date(),
    };
  }
}
