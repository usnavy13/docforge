/**
 * Core types for DocForge
 */

// Geometry types
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

// Color types
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// Document types
export type DocumentType = 'spreadsheet' | 'presentation';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  createdAt: Date;
  modifiedAt: Date;
}

// AI Command Protocol
export interface AICommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface AIResponse {
  commandId: string;
  success: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
  duration?: number;
}

// Cell types (for spreadsheet)
export type CellValue = string | number | boolean | null | Date;

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  backgroundColor?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  numberFormat?: string;
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
}

export interface BorderStyle {
  style: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted';
  color: string;
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// Shape types (for presentation)
export type ShapeType =
  | 'textbox'
  | 'rectangle'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'image';

export interface ShapeStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  shadow?: boolean;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
}

// Slide layout types
export type SlideLayout =
  | 'blank'
  | 'title'
  | 'titleAndContent'
  | 'twoColumn'
  | 'titleOnly'
  | 'contentOnly';
