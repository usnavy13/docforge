/**
 * Handler for sheet.getData command
 */

import type { AICommand } from '@docforge/core';
import { parseRange } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { GetDataPayload, GetDataResult } from './types';
import type { Workbook, Sheet, Cell } from '../types';

/**
 * Convert a Workbook with Map fields to a JSON-serializable object
 */
function serializeWorkbook(workbook: Workbook): Record<string, unknown> {
  return {
    id: workbook.id,
    title: workbook.title,
    activeSheet: workbook.activeSheet,
    sheets: workbook.sheets.map((sheet) => serializeSheet(sheet)),
  };
}

/**
 * Convert a Sheet with Map fields to a JSON-serializable object
 */
function serializeSheet(sheet: Sheet): Record<string, unknown> {
  // Convert cells Map to plain object
  const cells: Record<string, Cell> = {};
  for (const [key, cell] of sheet.cells) {
    cells[key] = cell;
  }

  // Convert rowHeights Map to plain object
  const rowHeights: Record<string, number> = {};
  for (const [row, height] of sheet.rowHeights) {
    rowHeights[String(row)] = height;
  }

  // Convert colWidths Map to plain object
  const colWidths: Record<string, number> = {};
  for (const [col, width] of sheet.colWidths) {
    colWidths[String(col)] = width;
  }

  return {
    id: sheet.id,
    name: sheet.name,
    cells,
    rowHeights,
    colWidths,
    merges: sheet.merges,
    charts: sheet.charts,
    frozenRows: sheet.frozenRows,
    frozenCols: sheet.frozenCols,
  };
}

/**
 * Create a handler for the sheet.getData command
 */
export function createGetDataHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: GetDataPayload, command: AICommand) => Promise<GetDataResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const workbook = editor.getData();

    // If no specific sheet or range, return entire workbook
    if (payload.sheetIndex === undefined && !payload.range) {
      // Serialize workbook to convert Maps to plain objects
      return { workbook: serializeWorkbook(workbook) as unknown as Workbook };
    }

    const sheetIndex = payload.sheetIndex ?? editor.getActiveSheet();
    const sheet = workbook.sheets[sheetIndex];

    if (!sheet) {
      throw new Error(`Sheet not found at index ${sheetIndex}`);
    }

    // If range is specified, return just that range
    if (payload.range) {
      const range = parseRange(payload.range);
      if (!range) {
        throw new Error(`Invalid range: ${payload.range}`);
      }

      const values: unknown[][] = [];
      for (let r = range.startRow; r <= range.endRow; r++) {
        const row: unknown[] = [];
        for (let c = range.startCol; c <= range.endCol; c++) {
          row.push(editor.getCellValue(sheetIndex, r, c));
        }
        values.push(row);
      }

      return {
        range: { values },
      };
    }

    // Return entire sheet data
    const data: unknown[][] = [];
    let maxRow = 0;
    let maxCol = 0;

    // Find dimensions
    for (const key of sheet.cells.keys()) {
      const [r, c] = key.split(',').map(Number);
      maxRow = Math.max(maxRow, r);
      maxCol = Math.max(maxCol, c);
    }

    // Build data array
    for (let r = 0; r <= maxRow; r++) {
      const row: unknown[] = [];
      for (let c = 0; c <= maxCol; c++) {
        const cell = sheet.cells.get(`${r},${c}`);
        row.push(cell?.value ?? null);
      }
      data.push(row);
    }

    return {
      sheet: {
        name: sheet.name,
        data,
      },
    };
  };
}
