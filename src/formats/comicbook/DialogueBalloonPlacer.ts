/**
 * Dialogue Balloon Placer
 * Optimal speech bubble placement for readability
 */

import {
  ComicPanel,
  Dialogue,
  SpeechBalloon,
  BalloonLayout,
  BalloonType,
  ComicCharacter
} from './types';

export class DialogueBalloonPlacer {
  /**
   * Place all dialogue balloons for a panel
   */
  async placeBalloons(panel: ComicPanel): Promise<BalloonLayout> {
    const balloons: SpeechBalloon[] = [];

    // Generate balloon for each dialogue
    for (let i = 0; i < panel.dialogue.length; i++) {
      const dialogue = panel.dialogue[i];
      const balloon = await this.createBalloon(dialogue, i, panel);
      balloons.push(balloon);
    }

    // Optimize reading order (left-to-right, top-to-bottom)
    const optimized = this.optimizeReadingOrder(balloons, panel);

    // Calculate estimated reading time
    const readingTime = this.estimateReadingTime(balloons);

    return {
      balloons: optimized,
      readingOrder: optimized.map((_, i) => i),
      estimatedReadingTime: readingTime
    };
  }

  /**
   * Create a single speech balloon
   */
  private async createBalloon(
    dialogue: Dialogue,
    index: number,
    panel: ComicPanel
  ): Promise<SpeechBalloon> {
    const character = this.findCharacter(dialogue.character, panel);
    const balloonType = this.determineBalloonType(dialogue);
    const position = this.calculatePosition(character, index, panel);
    const size = this.calculateSize(dialogue.text);

    return {
      character: dialogue.character,
      text: dialogue.text,
      type: balloonType,
      position,
      tailDirection: this.calculateTailDirection(character, position),
      size,
      readingOrder: index
    };
  }

  /**
   * Determine balloon type based on dialogue
   */
  private determineBalloonType(dialogue: Dialogue): BalloonType {
    if (dialogue.narration) return 'narration';
    if (dialogue.thought) return 'thought';
    if (dialogue.whisper) return 'whisper';
    if (dialogue.shout) return 'scream';
    if (dialogue.offPanel) return 'radio';
    return 'speech';
  }

  /**
   * Calculate balloon position
   */
  private calculatePosition(
    character: ComicCharacter | undefined,
    index: number,
    panel: ComicPanel
  ): { x: number; y: number } {
    // If character found, position above character
    if (character) {
      return {
        x: character.position.x,
        y: Math.max(0.1, character.position.y - 0.3) // Above character
      };
    }

    // Fallback: Position based on index
    const rows = Math.ceil(panel.dialogue.length / 2);
    const row = Math.floor(index / 2);
    const col = index % 2;

    return {
      x: 0.25 + col * 0.5, // Left or right half
      y: 0.2 + (row / rows) * 0.6 // Distribute vertically
    };
  }

  /**
   * Calculate speech balloon tail direction
   */
  private calculateTailDirection(
    character: ComicCharacter | undefined,
    balloonPosition: { x: number; y: number }
  ): number {
    if (!character) {
      return 180; // Point down by default
    }

    // Calculate angle from balloon to character
    const dx = character.position.x - balloonPosition.x;
    const dy = character.position.y - balloonPosition.y;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Normalize to 0-360
    if (angle < 0) angle += 360;

    return angle;
  }

  /**
   * Calculate balloon size based on text length
   */
  private calculateSize(text: string): { width: number; height: number } {
    const words = text.split(/\s+/).length;
    const chars = text.length;

    // Estimate dimensions (relative units)
    let width = Math.min(0.4, 0.15 + words * 0.02); // Max 40% of panel width
    let height = Math.min(0.3, 0.1 + chars * 0.002); // Max 30% of panel height

    // Adjust for very short text
    if (words <= 2) {
      width = 0.15;
      height = 0.08;
    }

    return { width, height };
  }

  /**
   * Optimize reading order for natural flow
   */
  private optimizeReadingOrder(
    balloons: SpeechBalloon[],
    panel: ComicPanel
  ): SpeechBalloon[] {
    // Sort by position (top-to-bottom, left-to-right)
    const sorted = [...balloons].sort((a, b) => {
      // Primary sort: vertical position (top first)
      const yDiff = a.position.y - b.position.y;
      if (Math.abs(yDiff) > 0.15) {
        return yDiff;
      }

      // Secondary sort: horizontal position (left first for LTR)
      return a.position.x - b.position.x;
    });

    // Update reading order
    sorted.forEach((balloon, index) => {
      balloon.readingOrder = index;
    });

    return sorted;
  }

  /**
   * Check for balloon overlaps
   */
  private checkOverlaps(balloons: SpeechBalloon[]): Array<{
    balloon1: number;
    balloon2: number;
    overlapPercentage: number;
  }> {
    const overlaps: Array<{
      balloon1: number;
      balloon2: number;
      overlapPercentage: number;
    }> = [];

    for (let i = 0; i < balloons.length; i++) {
      for (let j = i + 1; j < balloons.length; j++) {
        const overlap = this.calculateOverlap(balloons[i], balloons[j]);
        if (overlap > 0) {
          overlaps.push({
            balloon1: i,
            balloon2: j,
            overlapPercentage: overlap
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Calculate overlap between two balloons
   */
  private calculateOverlap(b1: SpeechBalloon, b2: SpeechBalloon): number {
    // Calculate bounding boxes
    const box1 = {
      left: b1.position.x - b1.size.width / 2,
      right: b1.position.x + b1.size.width / 2,
      top: b1.position.y - b1.size.height / 2,
      bottom: b1.position.y + b1.size.height / 2
    };

    const box2 = {
      left: b2.position.x - b2.size.width / 2,
      right: b2.position.x + b2.size.width / 2,
      top: b2.position.y - b2.size.height / 2,
      bottom: b2.position.y + b2.size.height / 2
    };

    // Check for overlap
    const xOverlap = Math.max(
      0,
      Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left)
    );
    const yOverlap = Math.max(
      0,
      Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top)
    );

    if (xOverlap === 0 || yOverlap === 0) {
      return 0;
    }

    // Calculate overlap area as percentage
    const overlapArea = xOverlap * yOverlap;
    const area1 = b1.size.width * b1.size.height;
    const area2 = b2.size.width * b2.size.height;
    const minArea = Math.min(area1, area2);

    return (overlapArea / minArea) * 100;
  }

  /**
   * Resolve balloon overlaps by adjusting positions
   */
  resolveOverlaps(layout: BalloonLayout): BalloonLayout {
    const balloons = [...layout.balloons];
    const maxIterations = 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      const overlaps = this.checkOverlaps(balloons);

      if (overlaps.length === 0) {
        break;
      }

      // Adjust positions for each overlap
      for (const overlap of overlaps) {
        const b1 = balloons[overlap.balloon1];
        const b2 = balloons[overlap.balloon2];

        // Move balloons apart
        if (b1.position.y < b2.position.y) {
          // Move b1 up, b2 down
          b1.position.y -= 0.05;
          b2.position.y += 0.05;
        } else {
          // Move b2 up, b1 down
          b2.position.y -= 0.05;
          b1.position.y += 0.05;
        }

        // Clamp positions to panel bounds
        b1.position.y = Math.max(0.05, Math.min(0.95, b1.position.y));
        b2.position.y = Math.max(0.05, Math.min(0.95, b2.position.y));
      }

      iteration++;
    }

    return {
      ...layout,
      balloons: this.optimizeReadingOrder(balloons, {} as ComicPanel)
    };
  }

  /**
   * Estimate reading time in seconds
   */
  private estimateReadingTime(balloons: SpeechBalloon[]): number {
    const wordsPerSecond = 3; // Average reading speed
    let totalWords = 0;

    for (const balloon of balloons) {
      totalWords += balloon.text.split(/\s+/).length;
    }

    return Math.ceil(totalWords / wordsPerSecond);
  }

  /**
   * Find character in panel
   */
  private findCharacter(
    characterName: string,
    panel: ComicPanel
  ): ComicCharacter | undefined {
    return panel.characters.find(
      char => char.name.toLowerCase() === characterName.toLowerCase()
    );
  }

  /**
   * Validate balloon placement
   */
  validatePlacement(layout: BalloonLayout): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for overlaps
    const overlaps = this.checkOverlaps(layout.balloons);
    if (overlaps.length > 0) {
      issues.push(`${overlaps.length} balloon overlaps detected`);
    }

    // Check reading order clarity
    const readingOrderIssues = this.validateReadingOrder(layout.balloons);
    issues.push(...readingOrderIssues);

    // Check balloon sizes
    for (const balloon of layout.balloons) {
      if (balloon.size.width > 0.5 || balloon.size.height > 0.4) {
        issues.push(`Balloon for "${balloon.character}" is too large`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate reading order clarity
   */
  private validateReadingOrder(balloons: SpeechBalloon[]): string[] {
    const issues: string[] = [];

    for (let i = 0; i < balloons.length - 1; i++) {
      const current = balloons[i];
      const next = balloons[i + 1];

      // Check if reading order is ambiguous
      // (next balloon is to the left AND above current)
      if (next.position.x < current.position.x && next.position.y < current.position.y) {
        issues.push(
          `Ambiguous reading order between balloon ${i} and ${i + 1}`
        );
      }
    }

    return issues;
  }
}
