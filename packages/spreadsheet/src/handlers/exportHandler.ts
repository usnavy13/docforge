/**
 * Handler for sheet.export command
 */

import type { AICommand } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type { ExportPayload, ExportResult } from './types';

/**
 * Create a handler for the sheet.export command
 */
export function createExportHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: ExportPayload, command: AICommand) => Promise<ExportResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const workbook = editor.getData();
    const filename = `${workbook.title || 'spreadsheet'}`;

    switch (payload.format) {
      case 'xlsx': {
        // TODO: Use @docforge/file-io writeXlsx when implemented
        const blob = await editor.exportToXlsx();
        return {
          blob,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: `${filename}.xlsx`,
        };
      }

      case 'csv': {
        const blob = await editor.exportToCsv(payload.sheetIndex);
        return {
          blob,
          mimeType: 'text/csv',
          filename: `${filename}.csv`,
        };
      }

      case 'pdf': {
        // PDF export not yet implemented
        throw new Error('PDF export not yet implemented');
      }

      default:
        throw new Error(`Unsupported export format: ${payload.format}`);
    }
  };
}
