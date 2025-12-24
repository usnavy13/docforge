/**
 * Handlers for sheet management commands
 */

import type { AICommand } from '@docforge/core';
import type { SpreadsheetEditorRef } from '../SpreadsheetEditor';
import type {
  AddSheetPayload,
  AddSheetResult,
  DeleteSheetPayload,
  DeleteSheetResult,
  RenameSheetPayload,
  RenameSheetResult,
} from './types';

/**
 * Create a handler for the sheet.addSheet command
 */
export function createAddSheetHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: AddSheetPayload, command: AICommand) => Promise<AddSheetResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const sheetId = editor.addSheet(payload.name);
    const workbook = editor.getData();
    const index = workbook.sheets.length - 1;
    const sheet = workbook.sheets[index];

    return {
      sheetId,
      sheetName: sheet.name,
      index,
    };
  };
}

/**
 * Create a handler for the sheet.deleteSheet command
 */
export function createDeleteSheetHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: DeleteSheetPayload, command: AICommand) => Promise<DeleteSheetResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const workbook = editor.getData();

    if (workbook.sheets.length <= 1) {
      throw new Error('Cannot delete the last sheet');
    }

    if (payload.index < 0 || payload.index >= workbook.sheets.length) {
      throw new Error(`Invalid sheet index: ${payload.index}`);
    }

    editor.deleteSheet(payload.index);

    const updatedWorkbook = editor.getData();

    return {
      deleted: true,
      remainingCount: updatedWorkbook.sheets.length,
    };
  };
}

/**
 * Create a handler for the sheet.renameSheet command
 */
export function createRenameSheetHandler(
  editorRef: React.RefObject<SpreadsheetEditorRef>
): (payload: RenameSheetPayload, command: AICommand) => Promise<RenameSheetResult> {
  return async (payload, _command) => {
    const editor = editorRef.current;
    if (!editor) {
      throw new Error('Spreadsheet editor not initialized');
    }

    const workbook = editor.getData();

    if (payload.index < 0 || payload.index >= workbook.sheets.length) {
      throw new Error(`Invalid sheet index: ${payload.index}`);
    }

    const oldName = workbook.sheets[payload.index].name;
    editor.renameSheet(payload.index, payload.name);

    return {
      oldName,
      newName: payload.name,
    };
  };
}
