// XLSX file operations using SheetJS
// TODO: Implement after integrating SheetJS

import type { XlsxOptions } from './types';

/**
 * Read an XLSX file and return workbook data
 */
export async function readXlsx(file: File | ArrayBuffer, _options?: XlsxOptions): Promise<unknown> {
  // TODO: Implement using SheetJS
  console.log('readXlsx called with:', file);
  throw new Error('readXlsx not yet implemented');
}

/**
 * Write workbook data to XLSX format
 */
export async function writeXlsx(workbook: unknown, _options?: XlsxOptions): Promise<Blob> {
  // TODO: Implement using SheetJS
  console.log('writeXlsx called with:', workbook);
  throw new Error('writeXlsx not yet implemented');
}
