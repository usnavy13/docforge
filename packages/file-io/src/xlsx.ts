/**
 * XLSX file operations using SheetJS
 */

import * as XLSX from 'xlsx';
import type { CellValue, CellStyle, BorderStyle } from '@docforge/core';
import type { XlsxOptions } from './types';

// SheetJS style types (not exported by xlsx package)
interface XLSXFont {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  sz?: number;
  name?: string;
  color?: { rgb?: string };
}

interface XLSXFill {
  patternType?: string;
  fgColor?: { rgb?: string };
}

interface XLSXAlignment {
  horizontal?: string;
  vertical?: string;
}

interface XLSXBorderPart {
  style?: string;
  color?: { rgb?: string };
}

interface XLSXBorder {
  top?: XLSXBorderPart;
  right?: XLSXBorderPart;
  bottom?: XLSXBorderPart;
  left?: XLSXBorderPart;
}

interface XLSXCellStyle {
  font?: XLSXFont;
  fill?: XLSXFill;
  alignment?: XLSXAlignment;
  border?: XLSXBorder;
  numFmt?: string;
}

// DocForge types (duplicated to avoid circular deps with spreadsheet package)
interface Workbook {
  id: string;
  title: string;
  sheets: Sheet[];
  activeSheet: number;
}

interface Sheet {
  id: string;
  name: string;
  cells: Map<string, Cell>;
  rowHeights: Map<number, number>;
  colWidths: Map<number, number>;
  merges: Merge[];
  charts: Chart[];
  frozenRows: number;
  frozenCols: number;
}

interface Cell {
  value: CellValue;
  formula?: string;
  style?: CellStyle;
  comment?: string;
}

interface Merge {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface Chart {
  id: string;
  type: string;
  dataRange: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
}

/**
 * Convert Excel column letter to 0-based index
 * @example colLetterToIndex('A') => 0, colLetterToIndex('Z') => 25, colLetterToIndex('AA') => 26
 */
function colLetterToIndex(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Convert 0-based column index to Excel column letter
 * @example colIndexToLetter(0) => 'A', colIndexToLetter(25) => 'Z', colIndexToLetter(26) => 'AA'
 */
function colIndexToLetter(index: number): string {
  let result = '';
  let n = index + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/**
 * Parse cell address - supports both "A1" format and "row,col" format
 */
function parseCellAddress(address: string): { row: number; col: number } {
  // Try "A1" format first
  const excelMatch = address.match(/^([A-Z]+)(\d+)$/);
  if (excelMatch) {
    return {
      col: colLetterToIndex(excelMatch[1]),
      row: parseInt(excelMatch[2], 10) - 1,
    };
  }

  // Try "row,col" format (used by spreadsheet editor internally)
  const rowColMatch = address.match(/^(\d+),(\d+)$/);
  if (rowColMatch) {
    return {
      row: parseInt(rowColMatch[1], 10),
      col: parseInt(rowColMatch[2], 10),
    };
  }

  throw new Error(`Invalid cell address: ${address}`);
}

/**
 * Convert row,col indices to Excel "A1" format
 */
function toExcelAddress(row: number, col: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Convert SheetJS cell style to DocForge CellStyle
 */
function sheetJsStyleToDocforge(style: XLSXCellStyle | undefined): CellStyle | undefined {
  if (!style) return undefined;

  const result: CellStyle = {};
  const font = style.font;
  const fill = style.fill;
  const alignment = style.alignment;
  const border = style.border;

  // Font properties
  if (font) {
    if (font.bold) result.bold = true;
    if (font.italic) result.italic = true;
    if (font.underline) result.underline = true;
    if (font.strike) result.strikethrough = true;
    if (font.sz) result.fontSize = font.sz;
    if (font.name) result.fontFamily = font.name;
    if (font.color?.rgb) result.fontColor = `#${font.color.rgb}`;
  }

  // Fill properties
  if (fill?.fgColor?.rgb) {
    result.backgroundColor = `#${fill.fgColor.rgb}`;
  }

  // Alignment
  if (alignment) {
    if (alignment.horizontal) {
      const h = alignment.horizontal as string;
      if (h === 'left' || h === 'center' || h === 'right') {
        result.horizontalAlign = h;
      }
    }
    if (alignment.vertical) {
      const v = alignment.vertical as string;
      if (v === 'top' || v === 'center' || v === 'bottom') {
        result.verticalAlign = v === 'center' ? 'middle' : v;
      }
    }
  }

  // Borders
  if (border) {
    if (border.top) result.borderTop = convertBorder(border.top);
    if (border.right) result.borderRight = convertBorder(border.right);
    if (border.bottom) result.borderBottom = convertBorder(border.bottom);
    if (border.left) result.borderLeft = convertBorder(border.left);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Convert SheetJS border to DocForge BorderStyle
 */
function convertBorder(border: XLSXBorderPart): BorderStyle {
  const styleMap: Record<string, BorderStyle['style']> = {
    thin: 'thin',
    medium: 'medium',
    thick: 'thick',
    dashed: 'dashed',
    dotted: 'dotted',
  };

  return {
    style: styleMap[border.style || 'thin'] || 'thin',
    color: border.color?.rgb ? `#${border.color.rgb}` : '#000000',
  };
}

/**
 * Convert DocForge CellStyle to SheetJS style
 */
function docforgeStyleToSheetJs(style: CellStyle | undefined): XLSXCellStyle | undefined {
  if (!style) return undefined;

  const result: XLSXCellStyle = {};

  // Font
  if (
    style.bold ||
    style.italic ||
    style.underline ||
    style.strikethrough ||
    style.fontSize ||
    style.fontFamily ||
    style.fontColor
  ) {
    result.font = {};
    if (style.bold) result.font.bold = true;
    if (style.italic) result.font.italic = true;
    if (style.underline) result.font.underline = true;
    if (style.strikethrough) result.font.strike = true;
    if (style.fontSize) result.font.sz = style.fontSize;
    if (style.fontFamily) result.font.name = style.fontFamily;
    if (style.fontColor) {
      result.font.color = { rgb: style.fontColor.replace('#', '') };
    }
  }

  // Fill
  if (style.backgroundColor) {
    result.fill = {
      patternType: 'solid',
      fgColor: { rgb: style.backgroundColor.replace('#', '') },
    };
  }

  // Alignment
  if (style.horizontalAlign || style.verticalAlign) {
    result.alignment = {};
    if (style.horizontalAlign) {
      result.alignment.horizontal = style.horizontalAlign;
    }
    if (style.verticalAlign) {
      result.alignment.vertical = style.verticalAlign === 'middle' ? 'center' : style.verticalAlign;
    }
  }

  // Borders
  if (style.borderTop || style.borderRight || style.borderBottom || style.borderLeft) {
    result.border = {};
    if (style.borderTop) result.border.top = convertDocforgeBorder(style.borderTop);
    if (style.borderRight) result.border.right = convertDocforgeBorder(style.borderRight);
    if (style.borderBottom) result.border.bottom = convertDocforgeBorder(style.borderBottom);
    if (style.borderLeft) result.border.left = convertDocforgeBorder(style.borderLeft);
  }

  // Number format
  if (style.numberFormat) {
    result.numFmt = style.numberFormat;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Convert DocForge BorderStyle to SheetJS border
 */
function convertDocforgeBorder(border: BorderStyle): XLSXBorderPart {
  return {
    style: border.style,
    color: { rgb: border.color.replace('#', '') },
  };
}

/**
 * Read an XLSX file and return DocForge workbook data
 */
export async function readXlsx(
  file: File | ArrayBuffer,
  options?: XlsxOptions
): Promise<Workbook> {
  // Convert File to ArrayBuffer if needed
  let buffer: ArrayBuffer;
  if (file instanceof File) {
    buffer = await file.arrayBuffer();
  } else {
    buffer = file;
  }

  // Parse with SheetJS
  const xlsxWorkbook = XLSX.read(buffer, {
    type: 'array',
    cellStyles: options?.includeStyles ?? true,
    password: options?.password,
  });

  // Convert to DocForge format
  const sheets: Sheet[] = xlsxWorkbook.SheetNames.map((sheetName) => {
    const xlsxSheet = xlsxWorkbook.Sheets[sheetName];
    const cells = new Map<string, Cell>();
    const rowHeights = new Map<number, number>();
    const colWidths = new Map<number, number>();
    const merges: Merge[] = [];

    // Get sheet range
    let range = xlsxSheet['!ref'] ? XLSX.utils.decode_range(xlsxSheet['!ref']) : null;

    // Fallback if !ref is missing (happens with some generators or programmatic creation)
    if (!range) {
      let minRow = Infinity;
      let minCol = Infinity;
      let maxRow = -Infinity;
      let maxCol = -Infinity;

      Object.keys(xlsxSheet).forEach(key => {
        if (key.startsWith('!')) return;

        // Basic check for cell address
        if (/^[A-Z]+\d+$/.test(key)) {
          const cellRef = XLSX.utils.decode_cell(key);
          minRow = Math.min(minRow, cellRef.r);
          minCol = Math.min(minCol, cellRef.c);
          maxRow = Math.max(maxRow, cellRef.r);
          maxCol = Math.max(maxCol, cellRef.c);
        }
      });

      if (minRow !== Infinity) {
        range = { s: { r: minRow, c: minCol }, e: { r: maxRow, c: maxCol } };
      }
    }

    // Process cells
    if (range) {
      for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const address = `${r},${c}`;
          // SheetJS still uses A1 keys for lookup
          const excelAddress = colIndexToLetter(c) + (r + 1);
          const xlsxCell = xlsxSheet[excelAddress] as XLSX.CellObject | undefined;

          if (xlsxCell) {
            const cell: Cell = {
              value: getCellValue(xlsxCell),
            };

            if (xlsxCell.f) {
              cell.formula = xlsxCell.f;
            }

            if (options?.includeStyles !== false && xlsxCell.s) {
              cell.style = sheetJsStyleToDocforge(xlsxCell.s as XLSXCellStyle);
            }

            if (xlsxCell.c && xlsxCell.c.length > 0) {
              cell.comment = xlsxCell.c.map((c) => c.t).join('\n');
            }

            cells.set(address, cell);
          }
        }
      }
    }

    // Process merges
    if (xlsxSheet['!merges']) {
      for (const merge of xlsxSheet['!merges']) {
        merges.push({
          startRow: merge.s.r,
          startCol: merge.s.c,
          endRow: merge.e.r,
          endCol: merge.e.c,
        });
      }
    }

    // Process row heights
    if (xlsxSheet['!rows']) {
      xlsxSheet['!rows'].forEach((row, idx) => {
        if (row?.hpt) {
          rowHeights.set(idx, row.hpt);
        }
      });
    }

    // Process column widths
    if (xlsxSheet['!cols']) {
      xlsxSheet['!cols'].forEach((col, idx) => {
        if (col?.wpx) {
          colWidths.set(idx, col.wpx);
        }
      });
    }

    return {
      id: generateId(),
      name: sheetName,
      cells,
      rowHeights,
      colWidths,
      merges,
      charts: [], // Charts not supported in import
      frozenRows: 0, // Freeze panes not in basic SheetJS
      frozenCols: 0,
    };
  });

  // Get title from file name or default
  let title = 'Untitled Workbook';
  if (file instanceof File) {
    title = file.name.replace(/\.xlsx?$/i, '');
  }

  return {
    id: generateId(),
    title: options?.sheetName ?? title,
    sheets,
    activeSheet: 0,
  };
}

/**
 * Get CellValue from SheetJS cell object
 */
function getCellValue(cell: XLSX.CellObject): CellValue {
  switch (cell.t) {
    case 'n': // number
      return cell.v as number;
    case 'b': // boolean
      return cell.v as boolean;
    case 'd': // date
      return cell.v as Date;
    case 'e': // error
      return null;
    case 's': // string
    case 'z': // stub (blank)
    default:
      return cell.v !== undefined ? String(cell.v) : null;
  }
}

/**
 * Write DocForge workbook data to XLSX format
 */
export async function writeXlsx(workbook: Workbook, options?: XlsxOptions): Promise<Blob> {
  // Create SheetJS workbook
  const xlsxWorkbook = XLSX.utils.book_new();

  for (const sheet of workbook.sheets) {
    // Convert cells to SheetJS format
    const sheetData: Record<string, XLSX.CellObject> = {};
    let maxRow = 0;
    let maxCol = 0;

    sheet.cells.forEach((cell, address) => {
      const { row, col } = parseCellAddress(address);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);

      const xlsxCell: XLSX.CellObject = {
        t: getCellType(cell.value),
        v: cell.value ?? '',
      };

      if (cell.formula) {
        // SheetJS expects formulas without the leading '='
        // If we pass "=SUM(A1:B1)", it treats it as a string "==SUM(A1:B1)" in Excel
        xlsxCell.f = cell.formula.startsWith('=') ? cell.formula.substring(1) : cell.formula;
      }

      if (options?.includeStyles !== false && cell.style) {
        xlsxCell.s = docforgeStyleToSheetJs(cell.style);
      }

      // Convert to Excel address format (A1, B2, etc.) for SheetJS
      const excelAddress = toExcelAddress(row, col);
      sheetData[excelAddress] = xlsxCell;
    });

    // Create worksheet
    const xlsxSheet: XLSX.WorkSheet = sheetData;

    // Set range
    if (sheet.cells.size > 0) {
      xlsxSheet['!ref'] = `A1:${colIndexToLetter(maxCol)}${maxRow + 1}`;
    }

    // Add merges
    if (sheet.merges.length > 0) {
      xlsxSheet['!merges'] = sheet.merges.map((merge) => ({
        s: { r: merge.startRow, c: merge.startCol },
        e: { r: merge.endRow, c: merge.endCol },
      }));
    }

    // Add row heights
    if (sheet.rowHeights.size > 0) {
      const rows: XLSX.RowInfo[] = [];
      sheet.rowHeights.forEach((height, idx) => {
        rows[idx] = { hpt: height };
      });
      xlsxSheet['!rows'] = rows;
    }

    // Add column widths
    if (sheet.colWidths.size > 0) {
      const cols: XLSX.ColInfo[] = [];
      sheet.colWidths.forEach((width, idx) => {
        cols[idx] = { wpx: width };
      });
      xlsxSheet['!cols'] = cols;
    }

    // Append to workbook
    XLSX.utils.book_append_sheet(xlsxWorkbook, xlsxSheet, sheet.name);
  }

  // Set workbook properties
  xlsxWorkbook.Props = {
    Title: workbook.title,
  };

  // Generate buffer
  const buffer = XLSX.write(xlsxWorkbook, {
    type: 'array',
    bookType: 'xlsx',
    cellStyles: options?.includeStyles ?? true,
    password: options?.password,
  });

  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Get SheetJS cell type from CellValue
 */
function getCellType(value: CellValue): XLSX.ExcelDataType {
  if (value === null || value === undefined) return 'z';
  if (typeof value === 'number') return 'n';
  if (typeof value === 'boolean') return 'b';
  if (value instanceof Date) return 'd';
  return 's';
}

/**
 * Convert CSV data to a DocForge Sheet
 */
export function csvToSheet(data: string[][], sheetName: string = 'Sheet1'): Sheet {
  const cells = new Map<string, Cell>();

  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    for (let c = 0; c < row.length; c++) {
      const rawValue = row[c];
      if (rawValue !== '' && rawValue !== null && rawValue !== undefined) {
        const address = `${r},${c}`;
        cells.set(address, {
          value: inferCellValue(rawValue),
        });
      }
    }
  }

  return {
    id: generateId(),
    name: sheetName,
    cells,
    rowHeights: new Map(),
    colWidths: new Map(),
    merges: [],
    charts: [],
    frozenRows: 0,
    frozenCols: 0,
  };
}

/**
 * Convert a DocForge Sheet to CSV data
 */
export function sheetToCsv(sheet: Sheet): string[][] {
  // Find the bounds of the data
  let maxRow = 0;
  let maxCol = 0;

  sheet.cells.forEach((_, address) => {
    const { row, col } = parseCellAddress(address);
    maxRow = Math.max(maxRow, row);
    maxCol = Math.max(maxCol, col);
  });

  // Create 2D array
  const result: string[][] = [];
  for (let r = 0; r <= maxRow; r++) {
    const row: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const address = `${r},${c}`;
      const cell = sheet.cells.get(address);
      row.push(cell?.value?.toString() ?? '');
    }
    result.push(row);
  }

  return result;
}

/**
 * Infer the appropriate type for a string value from CSV
 */
function inferCellValue(value: string): CellValue {
  // Try number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }

  // Try boolean
  const lower = value.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;

  // Keep as string
  return value;
}
