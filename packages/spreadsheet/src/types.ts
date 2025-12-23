// Types for @docforge/spreadsheet

import type { CellValue, CellStyle, AIResponse } from '@docforge/core';

export type ToolbarMode = 'full' | 'minimal' | 'none';

export interface SpreadsheetOptions {
  container: HTMLElement | string;
  toolbar?: ToolbarMode;
  readOnly?: boolean;
  aiEnabled?: boolean;
  initialData?: Workbook;
}

export interface SpreadsheetEvents {
  [key: string]: unknown;
  'document:changed': ChangeSet;
  'selection:changed': Selection;
  'command:executed': AIResponse;
  'cell:edited': CellEditEvent;
  'sheet:added': SheetEvent;
  'sheet:deleted': SheetEvent;
}

export interface Workbook {
  id: string;
  title: string;
  sheets: Sheet[];
  activeSheet: number;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Map<string, Cell>;
  rowHeights: Map<number, number>;
  colWidths: Map<number, number>;
  merges: Merge[];
  charts: Chart[];
  frozenRows: number;
  frozenCols: number;
}

export interface Cell {
  value: CellValue;
  formula?: string;
  style?: CellStyle;
  comment?: string;
}

export interface Merge {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface Chart {
  id: string;
  type: ChartType;
  dataRange: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
}

export type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area';

export interface Selection {
  sheet: number;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface ChangeSet {
  type: 'cell' | 'sheet' | 'format' | 'chart';
  changes: unknown[];
}

export interface CellEditEvent {
  sheet: number;
  row: number;
  col: number;
  oldValue: CellValue;
  newValue: CellValue;
}

export interface SheetEvent {
  index: number;
  name: string;
}
