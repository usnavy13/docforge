/**
 * AI Command Handlers for @docforge/spreadsheet
 */

import { SPREADSHEET_COMMANDS } from '@docforge/core';
import type { CommandRegistry } from '@docforge/ai-bridge';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';

import { createCreateHandler } from './createHandler';
import { createGetDataHandler } from './getDataHandler';
import { createSetCellsHandler } from './setCellsHandler';
import { createFormatHandler } from './formatHandler';
import { createInsertChartHandler } from './insertChartHandler';
import { createExportHandler } from './exportHandler';
import {
  createAddSheetHandler,
  createDeleteSheetHandler,
  createRenameSheetHandler,
} from './sheetHandlers';

/**
 * Register all spreadsheet command handlers with the registry
 *
 * @example
 * ```typescript
 * const registry = new CommandRegistry();
 * const editorRef = useRef<SpreadsheetEditorRef>(null);
 *
 * // After editor is mounted
 * registerSpreadsheetHandlers(registry, editorRef);
 *
 * // Now commands can be executed
 * await executor.execute({
 *   id: 'cmd-1',
 *   type: 'sheet.setCells',
 *   payload: { cells: [{ ref: 'A1', value: 'Hello' }] },
 *   timestamp: Date.now(),
 * });
 * ```
 */
export function registerSpreadsheetHandlers(
  registry: CommandRegistry,
  editorRef: React.RefObject<SpreadsheetEditorRef>
): void {
  registry.register(SPREADSHEET_COMMANDS.CREATE, createCreateHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.GET_DATA, createGetDataHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.SET_CELLS, createSetCellsHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.FORMAT, createFormatHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.INSERT_CHART, createInsertChartHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.EXPORT, createExportHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.ADD_SHEET, createAddSheetHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.DELETE_SHEET, createDeleteSheetHandler(editorRef));
  registry.register(SPREADSHEET_COMMANDS.RENAME_SHEET, createRenameSheetHandler(editorRef));
}

// Export individual handler creators for custom usage
export { createCreateHandler } from './createHandler';
export { createGetDataHandler } from './getDataHandler';
export { createSetCellsHandler } from './setCellsHandler';
export { createFormatHandler } from './formatHandler';
export { createInsertChartHandler } from './insertChartHandler';
export { createExportHandler } from './exportHandler';
export {
  createAddSheetHandler,
  createDeleteSheetHandler,
  createRenameSheetHandler,
} from './sheetHandlers';

// Export types
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
} from './types';
