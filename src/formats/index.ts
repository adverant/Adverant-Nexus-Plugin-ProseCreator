/**
 * Format-Specific Extensions Module
 *
 * Provides specialized formatting for different content types
 */

// Screenplay formatting
export * as Screenplay from './screenplay';

// YouTube script formatting
export * as YouTube from './youtube';

// Comic Book formatting and panel generation
export * as ComicBook from './comicbook';

// Poetry analysis and rhythm detection
export * as Poetry from './poetry';

// Re-export main classes for convenience
export { ComicBookFormatter } from './comicbook/ComicBookFormatter';
export { PanelGenerator } from './comicbook/PanelGenerator';
export { PoetryAnalyzer } from './poetry/PoetryAnalyzer';
