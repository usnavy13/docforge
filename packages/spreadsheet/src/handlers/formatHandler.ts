/**
 * Handler for sheet.format command
 */

import type { AICommand, CellStyle } from '@docforge/core';
import { parseRange } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { FormatPayload, FormatResult } from './types';

/**
 * Create a handler for the sheet.format command
 */
export function createFormatHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: FormatPayload, command: AICommand) => Promise<FormatResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const sheetIndex = payload.sheet ?? editor.getActiveSheet();
    const range = parseRange(payload.range);

    if (!range) {
      throw new Error(`Invalid range: ${payload.range}`);
    }

    let formattedCount = 0;

    for (let r = range.startRow; r <= range.endRow; r++) {
      for (let c = range.startCol; c <= range.endCol; c++) {
        // Get existing style and merge with new style
        const existingStyle = editor.getCellStyle(sheetIndex, r, c) ?? {};
        const mergedStyle: CellStyle = {
          ...existingStyle,
          ...payload.style,
        };

        editor.setCellStyle(sheetIndex, r, c, mergedStyle);
        formattedCount++;
      }
    }

    return { formattedCount };
  };
}
