/**
 * Panel Layout Optimizer
 * Optimizes panel arrangement for storytelling flow and visual impact
 */

import { ComicPanel, PageLayout, PanelSize } from './types';

interface LayoutTemplate {
  type: 'grid' | 'staggered' | 'tier' | 'splash' | 'custom';
  positions: Array<{ x: number; y: number; width: number; height: number }>;
  sizes: PanelSize[];
  dimensions: Array<{ width: number; height: number }>; // in mm
  readingOrder: number[];
}

export class PanelLayoutOptimizer {
  // Standard comic page dimensions (US Letter)
  private readonly PAGE_WIDTH_MM = 216; // 8.5 inches
  private readonly PAGE_HEIGHT_MM = 279; // 11 inches
  private readonly BLEED_MM = 3.175; // 1/8 inch bleed
  private readonly MARGIN_MM = 12.7; // 0.5 inch margin
  private readonly GUTTER_MM = 6.35; // 0.25 inch between panels

  /**
   * Optimize panel layout across multiple pages
   */
  async optimizePageLayout(panels: ComicPanel[]): Promise<PageLayout[]> {
    const pages: PageLayout[] = [];
    let currentPage: ComicPanel[] = [];

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];

      // Check if panel should be full-page splash
      if (this.shouldBeSplashPage(panel)) {
        // Finish current page if it has panels
        if (currentPage.length > 0) {
          pages.push(this.layoutPage(currentPage, pages.length + 1));
          currentPage = [];
        }

        // Create splash page
        pages.push(this.layoutSplashPage(panel, pages.length + 1));
        continue;
      }

      // Add panel to current page
      currentPage.push(panel);

      // Check if we should break to new page
      const nextPanel = panels[i + 1];
      if (
        currentPage.length >= 7 || // Max panels per page
        this.shouldBreakPage(panel, nextPanel)
      ) {
        pages.push(this.layoutPage(currentPage, pages.length + 1));
        currentPage = [];
      }
    }

    // Handle remaining panels
    if (currentPage.length > 0) {
      pages.push(this.layoutPage(currentPage, pages.length + 1));
    }

    return pages;
  }

  /**
   * Layout panels on a single page
   */
  private layoutPage(panels: ComicPanel[], pageNumber: number): PageLayout {
    const panelCount = panels.length;
    const template = this.selectLayout(panelCount, panels);

    // Apply template to panels
    const layoutPanels = panels.map((panel, i) => ({
      ...panel,
      position: template.positions[i],
      dimensions: template.dimensions[i]
    }));

    return {
      pageNumber,
      panelCount,
      panels: layoutPanels,
      layoutType: template.type,
      readingOrder: template.readingOrder
    };
  }

  /**
   * Create full-page splash layout
   */
  private layoutSplashPage(panel: ComicPanel, pageNumber: number): PageLayout {
    return {
      pageNumber,
      panelCount: 1,
      panels: [
        {
          ...panel,
          size: 'full-page',
          position: { x: 0, y: 0, width: 1, height: 1 },
          dimensions: {
            width: this.PAGE_WIDTH_MM - 2 * this.BLEED_MM,
            height: this.PAGE_HEIGHT_MM - 2 * this.BLEED_MM
          }
        }
      ],
      layoutType: 'splash',
      readingOrder: [0]
    };
  }

  /**
   * Select optimal layout template based on panel count and types
   */
  private selectLayout(panelCount: number, panels: ComicPanel[]): LayoutTemplate {
    // Check for large/emphasis panels
    const hasLarge = panels.some(p => p.size === 'large' || p.size === 'full-page');

    switch (panelCount) {
      case 1:
        return this.layout1Panel();
      case 2:
        return this.layout2Panels();
      case 3:
        return this.layout3Panels(hasLarge);
      case 4:
        return this.layout4Panels(hasLarge);
      case 5:
        return this.layout5Panels(hasLarge);
      case 6:
        return this.layout6Panels(); // Classic comic page
      case 7:
        return this.layout7Panels();
      default:
        return this.layoutCustom(panelCount);
    }
  }

  /**
   * 1 Panel Layout - Full page or large centered
   */
  private layout1Panel(): LayoutTemplate {
    return {
      type: 'splash',
      positions: [{ x: 0, y: 0, width: 1, height: 1 }],
      sizes: ['full-page'],
      dimensions: [
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM
        }
      ],
      readingOrder: [0]
    };
  }

  /**
   * 2 Panel Layout - Horizontal or vertical split
   */
  private layout2Panels(): LayoutTemplate {
    // Horizontal split (stacked)
    return {
      type: 'tier',
      positions: [
        { x: 0, y: 0, width: 1, height: 0.48 },
        { x: 0, y: 0.52, width: 1, height: 0.48 }
      ],
      sizes: ['large', 'large'],
      dimensions: [
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        },
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        }
      ],
      readingOrder: [0, 1]
    };
  }

  /**
   * 3 Panel Layout - Tier system
   */
  private layout3Panels(hasLarge: boolean): LayoutTemplate {
    if (hasLarge) {
      // 1 large on top, 2 smaller below
      return {
        type: 'tier',
        positions: [
          { x: 0, y: 0, width: 1, height: 0.48 },
          { x: 0, y: 0.52, width: 0.48, height: 0.48 },
          { x: 0.52, y: 0.52, width: 0.48, height: 0.48 }
        ],
        sizes: ['large', 'medium', 'medium'],
        dimensions: [
          {
            width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
            height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) * 0.5
          },
          {
            width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
            height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) * 0.5
          },
          {
            width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
            height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) * 0.5
          }
        ],
        readingOrder: [0, 1, 2]
      };
    }

    // 3 equal tiers
    return {
      type: 'tier',
      positions: [
        { x: 0, y: 0, width: 1, height: 0.31 },
        { x: 0, y: 0.345, width: 1, height: 0.31 },
        { x: 0, y: 0.69, width: 1, height: 0.31 }
      ],
      sizes: ['medium', 'medium', 'medium'],
      dimensions: [
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        }
      ],
      readingOrder: [0, 1, 2]
    };
  }

  /**
   * 4 Panel Layout - 2x2 grid
   */
  private layout4Panels(hasLarge: boolean): LayoutTemplate {
    // Standard 2x2 grid
    const width = (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2;
    const height = (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2;

    return {
      type: 'grid',
      positions: [
        { x: 0, y: 0, width: 0.48, height: 0.48 },
        { x: 0.52, y: 0, width: 0.48, height: 0.48 },
        { x: 0, y: 0.52, width: 0.48, height: 0.48 },
        { x: 0.52, y: 0.52, width: 0.48, height: 0.48 }
      ],
      sizes: ['medium', 'medium', 'medium', 'medium'],
      dimensions: [
        { width, height },
        { width, height },
        { width, height },
        { width, height }
      ],
      readingOrder: [0, 1, 2, 3]
    };
  }

  /**
   * 5 Panel Layout - Staggered
   */
  private layout5Panels(hasLarge: boolean): LayoutTemplate {
    // 2 on top, 3 on bottom
    return {
      type: 'staggered',
      positions: [
        { x: 0, y: 0, width: 0.48, height: 0.48 },
        { x: 0.52, y: 0, width: 0.48, height: 0.48 },
        { x: 0, y: 0.52, width: 0.31, height: 0.48 },
        { x: 0.345, y: 0.52, width: 0.31, height: 0.48 },
        { x: 0.69, y: 0.52, width: 0.31, height: 0.48 }
      ],
      sizes: ['medium', 'medium', 'small', 'small', 'small'],
      dimensions: [
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2
        }
      ],
      readingOrder: [0, 1, 2, 3, 4]
    };
  }

  /**
   * 6 Panel Layout - Classic 2x3 grid
   */
  private layout6Panels(): LayoutTemplate {
    const width = (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2;
    const height = (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3;

    return {
      type: 'grid',
      positions: [
        { x: 0, y: 0, width: 0.48, height: 0.31 },
        { x: 0.52, y: 0, width: 0.48, height: 0.31 },
        { x: 0, y: 0.345, width: 0.48, height: 0.31 },
        { x: 0.52, y: 0.345, width: 0.48, height: 0.31 },
        { x: 0, y: 0.69, width: 0.48, height: 0.31 },
        { x: 0.52, y: 0.69, width: 0.48, height: 0.31 }
      ],
      sizes: ['medium', 'medium', 'medium', 'medium', 'medium', 'medium'],
      dimensions: Array(6).fill({ width, height }),
      readingOrder: [0, 1, 2, 3, 4, 5]
    };
  }

  /**
   * 7 Panel Layout - Complex staggered
   */
  private layout7Panels(): LayoutTemplate {
    return {
      type: 'staggered',
      positions: [
        { x: 0, y: 0, width: 0.48, height: 0.31 },
        { x: 0.52, y: 0, width: 0.48, height: 0.31 },
        { x: 0, y: 0.345, width: 0.31, height: 0.31 },
        { x: 0.345, y: 0.345, width: 0.31, height: 0.31 },
        { x: 0.69, y: 0.345, width: 0.31, height: 0.31 },
        { x: 0, y: 0.69, width: 0.48, height: 0.31 },
        { x: 0.52, y: 0.69, width: 0.48, height: 0.31 }
      ],
      sizes: ['medium', 'medium', 'small', 'small', 'small', 'medium', 'medium'],
      dimensions: [
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        },
        {
          width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - this.GUTTER_MM) / 2,
          height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - 2 * this.GUTTER_MM) / 3
        }
      ],
      readingOrder: [0, 1, 2, 3, 4, 5, 6]
    };
  }

  /**
   * Custom layout for unusual panel counts
   */
  private layoutCustom(panelCount: number): LayoutTemplate {
    // Simple fallback: distribute evenly
    const positions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const sizes: PanelSize[] = [];
    const dimensions: Array<{ width: number; height: number }> = [];

    const rows = Math.ceil(Math.sqrt(panelCount));
    const cols = Math.ceil(panelCount / rows);

    for (let i = 0; i < panelCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      positions.push({
        x: col / cols,
        y: row / rows,
        width: 1 / cols - 0.02,
        height: 1 / rows - 0.02
      });

      sizes.push('medium');

      dimensions.push({
        width: (this.PAGE_WIDTH_MM - 2 * this.MARGIN_MM - (cols - 1) * this.GUTTER_MM) / cols,
        height: (this.PAGE_HEIGHT_MM - 2 * this.MARGIN_MM - (rows - 1) * this.GUTTER_MM) / rows
      });
    }

    return {
      type: 'custom',
      positions,
      sizes,
      dimensions,
      readingOrder: Array.from({ length: panelCount }, (_, i) => i)
    };
  }

  /**
   * Check if panel should be splash page
   */
  private shouldBeSplashPage(panel: ComicPanel): boolean {
    return (
      panel.size === 'full-page' ||
      panel.size === 'double-page-spread' ||
      (panel.importance !== undefined && panel.importance >= 0.95)
    );
  }

  /**
   * Check if we should break to new page after current panel
   */
  private shouldBreakPage(current: ComicPanel, next?: ComicPanel): boolean {
    if (!next) return true;

    // Break if next is splash
    if (this.shouldBeSplashPage(next)) {
      return true;
    }

    // Break if scene change
    if (current.location !== next.location) {
      return true;
    }

    // Break if significant time jump
    if (current.time && next.time && current.time !== next.time) {
      return true;
    }

    return false;
  }

  /**
   * Calculate optimal pacing for page sequence
   */
  calculatePacing(panels: ComicPanel[]): {
    overallPace: 'slow' | 'medium' | 'fast';
    panelsPerPage: number[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const avgPanelsPerPage = panels.length / Math.ceil(panels.length / 6);

    let pace: 'slow' | 'medium' | 'fast' = 'medium';

    if (avgPanelsPerPage < 4) {
      pace = 'slow';
      recommendations.push('Consider increasing panel density for better pacing');
    } else if (avgPanelsPerPage > 8) {
      pace = 'fast';
      recommendations.push('High panel density may feel rushed');
    }

    // Analyze panel size distribution
    const largePanels = panels.filter(p => p.size === 'large' || p.size === 'full-page').length;
    const largeRatio = largePanels / panels.length;

    if (largeRatio > 0.3) {
      recommendations.push('Many large panels - ensure visual variety');
    }

    return {
      overallPace: pace,
      panelsPerPage: [], // Would calculate actual distribution
      recommendations
    };
  }
}
