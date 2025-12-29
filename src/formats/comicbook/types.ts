/**
 * Comic Book Format Types
 * Industry-standard comic script formatting with AI panel generation
 */

export type ComicStyle = 'traditional' | 'manga' | 'european' | 'indie' | 'web_comic';

export type PanelSize = 'small' | 'medium' | 'large' | 'full-page' | 'double-page-spread';

export type ShotType =
  | 'extreme-close-up'  // Single facial feature
  | 'close-up'          // Face/shoulders
  | 'medium-shot'       // Waist up
  | 'full-shot'         // Full body
  | 'long-shot'         // Multiple characters/environment
  | 'establishing-shot' // Wide environment
  | 'over-shoulder'     // From behind character
  | 'point-of-view'     // From character's perspective
  | 'bird-eye'          // From above
  | 'worm-eye';         // From below

export type CameraAngle =
  | 'eye-level'
  | 'high-angle'
  | 'low-angle'
  | 'dutch-angle'
  | 'overhead'
  | 'ground-level';

export type BalloonType =
  | 'speech'
  | 'thought'
  | 'whisper'
  | 'scream'
  | 'caption'
  | 'narration'
  | 'radio'
  | 'electronic';

export interface ComicCharacter {
  name: string;
  expression: string;
  pose: string;
  position: {
    x: number; // 0-1 (left to right)
    y: number; // 0-1 (top to bottom)
  };
  facing: 'left' | 'right' | 'forward' | 'back' | 'three-quarter';
  costume?: string;
  props?: string[];
}

export interface Dialogue {
  character: string;
  text: string;
  thought?: boolean;
  whisper?: boolean;
  shout?: boolean;
  narration?: boolean;
  offPanel?: boolean; // Character speaking but not visible
}

export interface SpeechBalloon {
  character: string;
  text: string;
  type: BalloonType;
  position: {
    x: number;
    y: number;
  };
  tailDirection: number; // degrees, pointing to character
  size: {
    width: number;
    height: number;
  };
  readingOrder: number;
}

export interface PanelComposition {
  shotType: ShotType;
  angle: CameraAngle;
  perspective: 'one-point' | 'two-point' | 'three-point' | 'isometric';
  focalPoint: {
    x: number;
    y: number;
  };
  depth?: number; // 0-1, depth of field emphasis
  lighting?: {
    type: 'natural' | 'dramatic' | 'noir' | 'bright' | 'silhouette';
    direction: number; // degrees
    intensity: number; // 0-1
  };
}

export interface SoundEffect {
  text: string;
  style: 'bold' | 'jagged' | 'curved' | 'explosive' | 'whisper';
  position: {
    x: number;
    y: number;
  };
  size: number; // relative size
  color?: string;
}

export interface ComicPanel {
  number: number;
  size: PanelSize;
  description: string;
  artDirection: string;
  composition: PanelComposition;
  characters: ComicCharacter[];
  location: string;
  time?: string;
  captions: string[];
  dialogue: Dialogue[];
  sfx: SoundEffect[];
  borderStyle?: 'standard' | 'none' | 'jagged' | 'wavy' | 'double';
  bleedType?: 'none' | 'partial' | 'full'; // Image extends beyond panel border
  transitionTo?: 'moment-to-moment' | 'action-to-action' | 'subject-to-subject' | 'scene-to-scene' | 'aspect-to-aspect' | 'non-sequitur';
}

export interface PageLayout {
  pageNumber: number;
  panelCount: number;
  panels: Array<ComicPanel & {
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    dimensions: {
      width: number;  // in millimeters or inches
      height: number;
    };
  }>;
  layoutType: 'grid' | 'staggered' | 'tier' | 'splash' | 'custom';
  readingOrder: number[]; // Panel indices in reading order
  pageNotes?: string;
}

export interface ComicPage {
  pageNumber: number;
  panels: ComicPanel[];
  layoutSuggestion?: string;
}

export interface FormattedComicPage {
  page_number: number;
  panel_count: number;
  layout_suggestion: string;
  panels: FormattedPanel[];
}

export interface FormattedPanel {
  number: number;
  size: PanelSize;
  description: string;
  art_direction: string;
  composition: PanelComposition;
  characters: ComicCharacter[];
  location: string;
  time?: string;
  captions: string[];
  dialogue: Dialogue[];
  sfx: SoundEffect[];
}

export interface FormattedComicScript {
  cover: {
    title: string;
    issue_number: number;
    writer: string;
    artist?: string;
    date: string;
  };
  pages: FormattedComicPage[];
  total_pages: number;
  total_panels: number;
  dialogue_word_count: number;
  estimated_art_time_hours: number;
}

export interface Moment {
  description: string;
  characters: string[];
  action: string;
  emotion: string;
  importance: number; // 0-1 scale
  dialogue?: string[];
  narration?: string;
}

export interface Beat {
  beat_number: number;
  description: string;
  moments: Moment[];
  tone: string;
  pacing: 'slow' | 'medium' | 'fast';
}

export interface GeneratedPanels {
  pages: ComicPage[];
  total_panels: number;
  avg_panels_per_page: number;
  style: ComicStyle;
}

export interface BalloonLayout {
  balloons: SpeechBalloon[];
  readingOrder: number[];
  estimatedReadingTime: number; // seconds
}

export interface ArtDirection {
  overall_mood: string;
  color_palette: string[];
  lighting_notes: string;
  reference_artists?: string[];
  special_techniques?: string[];
  panel_specific_notes: Record<number, string>;
}
