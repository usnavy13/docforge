/**
 * Constants for DocForge
 */

// Default slide dimensions (16:9 aspect ratio at 96 DPI)
export const DEFAULT_SLIDE_WIDTH = 960;
export const DEFAULT_SLIDE_HEIGHT = 540;

// Default spreadsheet dimensions
export const DEFAULT_ROW_HEIGHT = 25;
export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_COUNT = 1000;
export const DEFAULT_COL_COUNT = 26;

// Command timeout (ms)
export const COMMAND_TIMEOUT = 30000;

// AI Command types
export const SPREADSHEET_COMMANDS = {
  CREATE: 'sheet.create',
  GET_DATA: 'sheet.getData',
  SET_CELLS: 'sheet.setCells',
  FORMAT: 'sheet.format',
  INSERT_CHART: 'sheet.insertChart',
  ADD_SHEET: 'sheet.addSheet',
  DELETE_SHEET: 'sheet.deleteSheet',
  RENAME_SHEET: 'sheet.renameSheet',
  EXPORT: 'sheet.export',
} as const;

export const PRESENTATION_COMMANDS = {
  CREATE: 'slide.create',
  ADD_SLIDE: 'slide.addSlide',
  DELETE_SLIDE: 'slide.deleteSlide',
  DUPLICATE_SLIDE: 'slide.duplicateSlide',
  REORDER_SLIDE: 'slide.reorderSlide',
  ADD_SHAPE: 'slide.addShape',
  ADD_TEXT: 'slide.addText',
  ADD_IMAGE: 'slide.addImage',
  UPDATE_SHAPE: 'slide.updateShape',
  DELETE_SHAPE: 'slide.deleteShape',
  FORMAT: 'slide.format',
  GET_DATA: 'slide.getData',
  EXPORT: 'slide.export',
} as const;

// Error codes
export const ERROR_CODES = {
  INVALID_COMMAND: 'INVALID_COMMAND',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  INVALID_RANGE: 'INVALID_RANGE',
  INVALID_SLIDE: 'INVALID_SLIDE',
  SHAPE_NOT_FOUND: 'SHAPE_NOT_FOUND',
  SHEET_NOT_FOUND: 'SHEET_NOT_FOUND',
  EXPORT_FAILED: 'EXPORT_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
  TIMEOUT: 'TIMEOUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Export formats
export const EXPORT_FORMATS = {
  SPREADSHEET: ['xlsx', 'csv', 'pdf', 'ods'] as const,
  PRESENTATION: ['pptx', 'pdf', 'odp', 'png'] as const,
};

// Chart types
export const CHART_TYPES = [
  'bar',
  'column',
  'line',
  'pie',
  'doughnut',
  'scatter',
  'area',
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

// Slide layouts
export const SLIDE_LAYOUTS = [
  'blank',
  'title',
  'titleAndContent',
  'twoColumn',
  'titleOnly',
  'contentOnly',
] as const;

// Shape types
export const SHAPE_TYPES = [
  'textbox',
  'rectangle',
  'ellipse',
  'triangle',
  'line',
  'arrow',
  'image',
] as const;

// File MIME types
export const MIME_TYPES = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
  csv: 'text/csv',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  png: 'image/png',
} as const;
