// Types for @docforge/presentation

import type {
  ShapeType,
  ShapeStyle,
  TextStyle,
  SlideLayout,
  AIResponse,
  Rect,
} from '@docforge/core';

export type ToolbarMode = 'full' | 'minimal' | 'none';

export interface PresentationOptions {
  container: HTMLElement | string;
  toolbar?: ToolbarMode;
  readOnly?: boolean;
  aiEnabled?: boolean;
  initialData?: Presentation;
}

export interface PresentationEvents {
  [key: string]: unknown;
  'document:changed': ChangeSet;
  'selection:changed': ShapeSelection;
  'command:executed': AIResponse;
  'slide:added': SlideEvent;
  'slide:deleted': SlideEvent;
  'shape:added': ShapeEvent;
  'shape:deleted': ShapeEvent;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  slideWidth: number;
  slideHeight: number;
  theme?: PresentationTheme;
}

export interface Slide {
  id: string;
  layout: SlideLayout;
  shapes: Shape[];
  background?: Background;
  transition?: Transition;
  notes?: string;
}

export interface Shape extends Rect {
  id: string;
  type: ShapeType;
  rotation: number;
  zIndex: number;
  style: ShapeStyle;
  text?: RichText;
  src?: string; // For images
  points?: Array<{ x: number; y: number }>; // For lines/arrows
}

export interface RichText {
  content: string;
  style: TextStyle;
}

export interface Background {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradientColors?: string[];
  imageSrc?: string;
}

export interface Transition {
  type: 'none' | 'fade' | 'slide' | 'zoom';
  duration: number;
  autoAdvance?: number;
}

export interface PresentationTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface ShapeSelection {
  slideIndex: number;
  shapeIds: string[];
}

export interface ChangeSet {
  type: 'slide' | 'shape' | 'format';
  changes: unknown[];
}

export interface SlideEvent {
  index: number;
}

export interface ShapeEvent {
  slideIndex: number;
  shapeId: string;
}
