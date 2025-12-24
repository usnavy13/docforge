// @docforge/spreadsheet - Spreadsheet editor for DocForge
// Based on FortuneSheet

// React component (recommended)
export { SpreadsheetEditor } from './SpreadsheetEditor';
export type { SpreadsheetEditorProps, SpreadsheetEditorRef } from './SpreadsheetEditor';

// Legacy class-based API (deprecated, will be removed)
export { Spreadsheet } from './Spreadsheet';

// Types
export type {
  SpreadsheetOptions,
  SpreadsheetEvents,
  Workbook,
  Sheet,
  Cell,
  Merge,
  Chart,
  ChartType,
  Selection,
  ChangeSet,
  CellEditEvent,
  SheetEvent,
  ToolbarMode,
} from './types';

// Adapters
export {
  docforgeToFortuneSheet,
  fortuneSheetToDocforge,
  createEmptyFortuneSheetData,
} from './adapters';

// AI Command Handlers
export { registerSpreadsheetHandlers } from './handlers';
export {
  createCreateHandler,
  createGetDataHandler,
  createSetCellsHandler,
  createFormatHandler,
  createInsertChartHandler,
  createExportHandler,
  createAddSheetHandler,
  createDeleteSheetHandler,
  createRenameSheetHandler,
} from './handlers';

// Handler types
export type {
  CreatePayload,
  CreateResult,
  GetDataPayload,
  GetDataResult,
  SetCellsPayload,
  SetCellsResult,
  FormatPayload,
  FormatResult,
  InsertChartPayload,
  InsertChartResult,
  ExportPayload,
  ExportResult,
  AddSheetPayload,
  AddSheetResult,
  DeleteSheetPayload,
  DeleteSheetResult,
  RenameSheetPayload,
  RenameSheetResult,
} from './handlers';

// Re-export core types for convenience
export type { CellValue, CellStyle, CellRange, AICommand, AIResponse } from '@docforge/core';
