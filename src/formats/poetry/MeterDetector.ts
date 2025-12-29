/**
 * Meter Detector
 * Detects metrical patterns in poetry lines
 */

import { Meter, MeterType, Stress } from './types';
import { StressPatternDetector } from './StressPatternDetector';

export class MeterDetector {
  private stressDetector: StressPatternDetector;

  constructor() {
    this.stressDetector = new StressPatternDetector();
  }

  /**
   * Detect meter for a single line
   */
  async detectMeter(line: string): Promise<Meter> {
    const stressPattern = await this.stressDetector.detectStressPattern(line);

    const feet = stressPattern.feet.length;
    const meterType = stressPattern.dominantMeter;
    const meterName = this.getMeterName(meterType, feet);

    // Identify variations from expected pattern
    const variations = this.findVariations(stressPattern.feet, meterType);

    return {
      type: meterType,
      feet,
      name: meterName,
      pattern: stressPattern.stresses,
      confidence: stressPattern.meterStrength,
      variations
    };
  }

  /**
   * Detect meter for multiple lines and find consistency
   */
  async detectConsistentMeter(lines: string[]): Promise<{
    meter: Meter;
    consistency: number;
    lineMeters: Meter[];
  }> {
    const lineMeters: Meter[] = [];

    for (const line of lines) {
      const meter = await this.detectMeter(line);
      lineMeters.push(meter);
    }

    // Find most common meter
    const meterCounts: Map<string, number> = new Map();
    for (const meter of lineMeters) {
      const key = `${meter.type}-${meter.feet}`;
      meterCounts.set(key, (meterCounts.get(key) || 0) + 1);
    }

    let dominantKey = '';
    let maxCount = 0;
    for (const [key, count] of meterCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantKey = key;
      }
    }

    const [dominantType, dominantFeet] = dominantKey.split('-');
    const consistency = maxCount / lines.length;

    // Find representative meter
    const representativeMeter = lineMeters.find(
      m => m.type === dominantType && m.feet === parseInt(dominantFeet)
    ) || lineMeters[0];

    return {
      meter: representativeMeter,
      consistency,
      lineMeters
    };
  }

  /**
   * Get meter name from type and foot count
   */
  getMeterName(meterType: MeterType, feet: number): string {
    const feetNames = [
      '', 'monometer', 'dimeter', 'trimeter', 'tetrameter',
      'pentameter', 'hexameter', 'heptameter', 'octameter'
    ];

    const feetName = feetNames[feet] || `${feet}-foot`;

    return `${meterType} ${feetName}`;
  }

  /**
   * Find variations from expected metrical pattern
   */
  private findVariations(
    feet: any[],
    expectedMeter: MeterType
  ): Array<{
    position: number;
    expected: MeterType;
    actual: MeterType;
    reason: string;
  }> {
    const variations: Array<{
      position: number;
      expected: MeterType;
      actual: MeterType;
      reason: string;
    }> = [];

    for (let i = 0; i < feet.length; i++) {
      const foot = feet[i];
      if (foot.type !== expectedMeter && foot.type !== 'free') {
        variations.push({
          position: i + 1,
          expected: expectedMeter,
          actual: foot.type,
          reason: this.explainVariation(expectedMeter, foot.type)
        });
      }
    }

    return variations;
  }

  /**
   * Explain why variation occurred
   */
  private explainVariation(expected: MeterType, actual: MeterType): string {
    const reasons: Record<string, string> = {
      'iambic-trochaic': 'Inverted foot at beginning (common in iambic meter)',
      'iambic-spondaic': 'Spondaic substitution for emphasis',
      'iambic-pyrrhic': 'Pyrrhic foot for variation',
      'trochaic-iambic': 'Inverted foot',
      'anapestic-iambic': 'Reduction to iambic foot',
      'dactylic-trochaic': 'Reduction to trochaic foot'
    };

    return reasons[`${expected}-${actual}`] || 'Metrical variation';
  }

  /**
   * Check if lines follow iambic pentameter
   */
  async isIambicPentameter(lines: string[]): Promise<boolean> {
    const result = await this.detectConsistentMeter(lines);

    return (
      result.meter.type === 'iambic' &&
      result.meter.feet === 5 &&
      result.consistency >= 0.7
    );
  }

  /**
   * Validate meter quality
   */
  validateMeter(meter: Meter): {
    valid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check consistency
    if (meter.confidence < 0.6) {
      issues.push('Meter is inconsistent');
      suggestions.push('Review stress patterns for regularity');
    }

    // Check for common mistakes
    if (meter.variations.length > meter.feet * 0.3) {
      issues.push('Too many metrical variations');
      suggestions.push('Reduce variations to maintain rhythm');
    }

    // Check foot count
    if (meter.feet < 2) {
      issues.push('Very short line');
      suggestions.push('Consider expanding for more rhythmic effect');
    }

    if (meter.feet > 8) {
      issues.push('Very long line');
      suggestions.push('Consider breaking into shorter lines');
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };
  }
}
