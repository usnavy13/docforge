/**
 * Types for spreadsheet AI command handlers
 */

import type { CellStyle } from '@docforge/core';
import type { Workbook, ChartType } from '../types';

// sheet.create payload
export interface CreatePayload {
  title?: string;
  sheets?: Array<{
    name: string;
    data?: unknown[][];
  }>;
}

export interface CreateResult {
  documentId: string;
  title: string;
  sheetCount: number;
}

// sheet.getData payload
export interface GetDataPayload {
  sheetIndex?: number;
  range?: string; // e.g., "A1:C10"
}

export interface GetDataResult {
  workbook?: Workbook;
  sheet?: {
    name: string;
    data: unknown[][];
  };
  range?: {
    values: unknown[][];
  };
}

// sheet.setCells payload
export interface SetCellsPayload {
  sheet?: number;
  cells: Array<{
    ref: string; // e.g., "A1" or "B2:D5"
    value?: unknown;
    values?: unknown[][];
    formula?: string;
  }>;
}

export interface SetCellsResult {
  updatedCount: number;
}

// sheet.format payload
export interface FormatPayload {
  sheet?: number;
  range: string;
  style: Partial<CellStyle>;
}

export interface FormatResult {
  formattedCount: number;
}

// sheet.insertChart payload
export interface InsertChartPayload {
  sheet?: number;
  type: ChartType;
  dataRange: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  title?: string;
}

export interface InsertChartResult {
  chartId: string;
}

// sheet.export payload
export interface ExportPayload {
  format: 'xlsx' | 'csv' | 'pdf';
  sheetIndex?: number; // For CSV
  options?: {
    includeStyles?: boolean;
    password?: string;
  };
}

export interface ExportResult {
  blob: Blob;
  mimeType: string;
  filename: string;
}

// sheet.addSheet payload
export interface AddSheetPayload {
  name?: string;
  position?: number;
}

export interface AddSheetResult {
  sheetId: string;
  sheetName: string;
  index: number;
}

// sheet.deleteSheet payload
export interface DeleteSheetPayload {
  index: number;
}

export interface DeleteSheetResult {
  deleted: boolean;
  remainingCount: number;
}

// sheet.renameSheet payload
export interface RenameSheetPayload {
  index: number;
  name: string;
}

export interface RenameSheetResult {
  oldName: string;
  newName: string;
}

// Helper interface for creating handlers with SpreadsheetEditorRef
export interface HandlerContext {
  editorRef: React.RefObject<import('../SpreadsheetEditor').SpreadsheetEditorRef>;
}
