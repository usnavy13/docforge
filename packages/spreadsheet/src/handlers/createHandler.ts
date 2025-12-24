/**
 * Handler for sheet.create command
 */

import type { AICommand } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { CreatePayload, CreateResult } from './types';

/**
 * Create a handler for the sheet.create command
 */
export function createCreateHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: CreatePayload, command: AICommand) => Promise<CreateResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    // Clear existing data
    editor.clear();

    const workbook = editor.getData();
    const title = payload.title ?? workbook.title;

    // If sheets are provided, set them up
    if (payload.sheets && payload.sheets.length > 0) {
      // Rename first sheet
      if (payload.sheets[0]) {
        editor.renameSheet(0, payload.sheets[0].name);

        // Set initial data if provided
        if (payload.sheets[0].data && payload.sheets[0].data.length > 0) {
          const data = payload.sheets[0].data;
          editor.setCellsByRange(0, {
            startRow: 0,
            startCol: 0,
            endRow: data.length - 1,
            endCol: Math.max(...data.map((row) => row.length)) - 1,
          }, data as Array<Array<import('@docforge/core').CellValue>>);
        }
      }

      // Add additional sheets
      for (let i = 1; i < payload.sheets.length; i++) {
        const sheetDef = payload.sheets[i];
        editor.addSheet(sheetDef.name);

        // Set initial data if provided
        if (sheetDef.data && sheetDef.data.length > 0) {
          const data = sheetDef.data;
          editor.setCellsByRange(i, {
            startRow: 0,
            startCol: 0,
            endRow: data.length - 1,
            endCol: Math.max(...data.map((row) => row.length)) - 1,
          }, data as Array<Array<import('@docforge/core').CellValue>>);
        }
      }
    }

    // Update workbook after changes
    const updatedWorkbook = editor.getData();

    return {
      documentId: updatedWorkbook.id,
      title,
      sheetCount: updatedWorkbook.sheets.length,
    };
  };
}
