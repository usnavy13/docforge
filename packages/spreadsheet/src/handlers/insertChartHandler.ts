/**
 * Handler for sheet.insertChart command
 */

import type { AICommand } from '@docforge/core';
import { generateId } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { InsertChartPayload, InsertChartResult } from './types';

/**
 * Create a handler for the sheet.insertChart command
 *
 * Note: Chart support is limited in FortuneSheet. This handler
 * creates chart metadata but actual rendering may require additional work.
 */
export function createInsertChartHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: InsertChartPayload, command: AICommand) => Promise<InsertChartResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    // Generate chart ID
    const chartId = generateId();

    // TODO: Implement actual chart insertion
    // FortuneSheet has limited chart support, so this is a placeholder
    // In a full implementation, this would:
    // 1. Parse the dataRange
    // 2. Create chart configuration
    // 3. Add chart to the sheet

    console.warn('Chart insertion is not fully implemented yet. Chart ID:', chartId, 'Payload:', payload);

    return { chartId };
  };
}
