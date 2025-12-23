// CSV file operations

import type { CsvOptions } from './types';

/**
 * Read a CSV file and return data
 */
export async function readCsv(
  file: File | string,
  options?: CsvOptions
): Promise<string[][]> {
  const delimiter = options?.delimiter ?? ',';
  const quoteChar = options?.quoteChar ?? '"';

  let text: string;
  if (file instanceof File) {
    text = await file.text();
  } else {
    text = file;
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === quoteChar && nextChar === quoteChar) {
        currentCell += quoteChar;
        i++;
      } else if (char === quoteChar) {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === quoteChar) {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Write data to CSV format
 */
export async function writeCsv(
  data: string[][],
  options?: CsvOptions
): Promise<Blob> {
  const delimiter = options?.delimiter ?? ',';
  const quoteChar = options?.quoteChar ?? '"';

  const escape = (cell: string): string => {
    if (
      cell.includes(delimiter) ||
      cell.includes(quoteChar) ||
      cell.includes('\n') ||
      cell.includes('\r')
    ) {
      return quoteChar + cell.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar) + quoteChar;
    }
    return cell;
  };

  const csv = data.map((row) => row.map(escape).join(delimiter)).join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
}
