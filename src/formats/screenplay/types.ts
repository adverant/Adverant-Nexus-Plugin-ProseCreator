/**
 * Screenplay Format Type Definitions
 * Industry-standard screenplay formatting types
 */

export interface ScreenplayStyle {
  font: string;
  size: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  marginLeft?: string;
  marginRight?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
  maxWidth?: string;
  textAlign?: 'left' | 'right' | 'center';
}

export interface SceneHeading {
  text: string;
  number?: number;
  intExt: 'INT.' | 'EXT.' | 'INT./EXT.' | 'EXT./INT.';
  location: string;
  timeOfDay: string;
  style: ScreenplayStyle;
}

export interface Action {
  text: string;
  style: ScreenplayStyle;
}

export interface Parenthetical {
  text: string;
  style: ScreenplayStyle;
}

export interface DialogueLine {
  text: string;
  style: ScreenplayStyle;
}

export interface Dialogue {
  character: {
    text: string;
    style: ScreenplayStyle;
    extension?: string; // (V.O.), (O.S.), (CONT'D)
  };
  parenthetical?: Parenthetical;
  lines: DialogueLine[];
  dualDialogue?: boolean;
}

export interface Transition {
  text: string;
  type: 'CUT TO:' | 'FADE TO:' | 'DISSOLVE TO:' | 'MATCH CUT TO:' | 'SMASH CUT TO:';
  style: ScreenplayStyle;
}

export interface Scene {
  scene_number: number;
  heading: SceneHeading;
  action: Action[];
  dialogue: Dialogue[];
  transition?: Transition;
  interior: boolean;
  location: string;
  time_of_day: string;
  page_number_start?: number;
  page_number_end?: number;
  estimated_duration?: number; // seconds
}

export interface TitlePage {
  title: string;
  subtitle?: string;
  author: string;
  based_on?: string;
  contact?: string;
  draft_date: string;
  draft_number?: string;
  copyright?: string;
}

export interface Screenplay {
  title: string;
  author: string;
  title_page: TitlePage;
  scenes: Scene[];
  metadata: {
    genre: string;
    logline?: string;
    page_count: number;
    scene_count: number;
    estimated_runtime: number; // minutes
    created_at: Date;
    updated_at: Date;
  };
}

export interface FormattedScene {
  heading: SceneHeading;
  action: Action[];
  dialogue: Dialogue[];
  transition?: Transition;
}

export interface FormattedScreenplay {
  title_page: string; // Formatted HTML/text
  scenes: FormattedScene[];
  page_count: number;
  reading_time: number; // minutes
  metadata: {
    format: 'fountain' | 'fdx' | 'pdf' | 'html';
    version: string;
    created_at: Date;
  };
}

// Fountain format types
export interface FountainElement {
  type: 'title_page' | 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'note';
  text: string;
  line_number: number;
}

export interface FountainMetadata {
  title?: string;
  credit?: string;
  author?: string;
  source?: string;
  draft_date?: string;
  contact?: string;
}

// Final Draft XML types
export interface FinalDraftParagraph {
  type: 'Scene Heading' | 'Action' | 'Character' | 'Dialogue' | 'Parenthetical' | 'Transition';
  text: string;
  dual_dialogue?: 'Left' | 'Right';
}

// Screenplay analysis types
export interface ScreenplayAnalysis {
  page_count: number;
  scene_count: number;
  dialogue_percentage: number;
  action_percentage: number;
  average_scene_length: number; // pages
  estimated_runtime: number; // minutes
  act_structure: {
    act_1: { page_start: number; page_end: number; scene_count: number };
    act_2: { page_start: number; page_end: number; scene_count: number };
    act_3: { page_start: number; page_end: number; scene_count: number };
  };
  character_appearances: Array<{
    character: string;
    dialogue_count: number;
    scene_count: number;
  }>;
  location_breakdown: Array<{
    location: string;
    int_ext: 'INT.' | 'EXT.';
    scene_count: number;
  }>;
}

export interface ScreenplayFormattingOptions {
  font: string;
  fontSize: number;
  pageSize: 'US Letter' | 'A4';
  sceneNumbers: boolean;
  revisionMarks: boolean;
  watermark?: string;
  headerText?: string;
  footerText?: string;
}

export interface ScreenplayExportFormat {
  format: 'fountain' | 'fdx' | 'pdf' | 'html' | 'docx';
  options: ScreenplayFormattingOptions;
}

// Character cue types for dialogue
export type CharacterExtension = 'V.O.' | 'O.S.' | 'O.C.' | 'CONT\'D' | 'PRE-LAP' | 'SUBTITLE';

// Time of day constants
export type TimeOfDay = 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'CONTINUOUS' | 'LATER' | 'MOMENTS LATER' | 'SAME TIME';

// Location types
export type LocationType = 'INT.' | 'EXT.' | 'INT./EXT.' | 'EXT./INT.' | 'I/E';
