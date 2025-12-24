/**
 * Handler for sheet.setCells command
 */

import type { AICommand, CellValue } from '@docforge/core';
import { parseRange, parseCellRef } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { SetCellsPayload, SetCellsResult } from './types';

/**
 * Create a handler for the sheet.setCells command
 */
export function createSetCellsHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: SetCellsPayload, command: AICommand) => Promise<SetCellsResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const sheetIndex = payload.sheet ?? editor.getActiveSheet();
    let updatedCount = 0;

    for (const cellDef of payload.cells) {
      // Try to parse as range first (e.g., "A1:B2")
      const range = parseRange(cellDef.ref);

      if (range) {
        // It's a range
        if (cellDef.values) {
          // Set multiple values
          editor.setCellsByRange(sheetIndex, range, cellDef.values as CellValue[][]);
          updatedCount += cellDef.values.flat().length;
        } else if (cellDef.value !== undefined || cellDef.formula !== undefined) {
          // Set single value/formula to all cells in range
          const value = cellDef.formula ? `=${cellDef.formula}` : (cellDef.value as CellValue);
          for (let r = range.startRow; r <= range.endRow; r++) {
            for (let c = range.startCol; c <= range.endCol; c++) {
              editor.setCellValue(sheetIndex, r, c, value);
              updatedCount++;
            }
          }
        }
      } else {
        // Try to parse as single cell reference (e.g., "A1")
        const cell = parseCellRef(cellDef.ref);
        if (!cell) {
          throw new Error(`Invalid cell reference: ${cellDef.ref}`);
        }

        const value = cellDef.formula
          ? `=${cellDef.formula}`
          : (cellDef.value as CellValue);
        editor.setCellValue(sheetIndex, cell.row, cell.col, value);
        updatedCount++;
      }
    }

    return { updatedCount };
  };
}
