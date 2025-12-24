/**
 * Data adapters for converting between DocForge and FortuneSheet formats
 */

import type { Sheet as FSSheet, Cell as FSCell, CellMatrix, CellWithRowAndCol } from '@fortune-sheet/core';
import type { Workbook, Sheet, Cell, Merge } from '../types';
import type { CellStyle, CellValue } from '@docforge/core';
import { generateId } from '@docforge/core';

/**
 * Convert DocForge Workbook to FortuneSheet Sheet array
 */
export function docforgeToFortuneSheet(workbook: Workbook): FSSheet[] {
  return workbook.sheets.map((sheet, index) => {
    return docforgeSheetToFS(sheet, index, index === workbook.activeSheet);
  });
}

/**
 * Convert a single DocForge Sheet to FortuneSheet Sheet
 */
function docforgeSheetToFS(sheet: Sheet, order: number, isActive: boolean): FSSheet {
  // Convert cells Map to CellMatrix with padding
  const { data, maxRow, maxCol } = cellsMapToMatrix(sheet.cells, 100, 26);

  // Convert merges
  const merge: Record<string, { r: number; c: number; rs: number; cs: number }> = {};
  for (const m of sheet.merges) {
    const key = `${m.startRow}_${m.startCol}`;
    merge[key] = {
      r: m.startRow,
      c: m.startCol,
      rs: m.endRow - m.startRow + 1,
      cs: m.endCol - m.startCol + 1,
    };
  }

  // Convert row heights and column widths
  const rowlen: Record<string, number> = {};
  for (const [row, height] of sheet.rowHeights) {
    rowlen[String(row)] = height;
  }

  const columnlen: Record<string, number> = {};
  for (const [col, width] of sheet.colWidths) {
    columnlen[String(col)] = width;
  }

  return {
    id: sheet.id,
    name: sheet.name,
    order,
    status: isActive ? 1 : 0,
    data,
    row: maxRow + 1,
    column: maxCol + 1,
    config: {
      merge: Object.keys(merge).length > 0 ? merge : undefined,
      rowlen: Object.keys(rowlen).length > 0 ? rowlen : undefined,
      columnlen: Object.keys(columnlen).length > 0 ? columnlen : undefined,
    },
    frozen: sheet.frozenRows > 0 || sheet.frozenCols > 0
      ? {
        type: sheet.frozenRows > 0 && sheet.frozenCols > 0 ? 'both' : sheet.frozenRows > 0 ? 'row' : 'column',
        range: {
          row_focus: sheet.frozenRows > 0 ? sheet.frozenRows - 1 : 0,
          column_focus: sheet.frozenCols > 0 ? sheet.frozenCols - 1 : 0,
        },
      }
      : undefined,
  };
}

/**
 * Convert cells Map to FortuneSheet CellMatrix
 * Ensures the matrix is fully populated up to the configured dimensions to prevent runtime errors
 */
function cellsMapToMatrix(cells: Map<string, Cell>, minRows = 100, minCols = 26): { data: CellMatrix; maxRow: number; maxCol: number } {
  let maxRow = 0;
  let maxCol = 0;

  // Find dimensions based on actual data
  for (const key of cells.keys()) {
    const [r, c] = key.split(',').map(Number);
    if (!isNaN(r) && !isNaN(c)) {
      maxRow = Math.max(maxRow, r);
      maxCol = Math.max(maxCol, c);
    }
  }

  // Ensure we cover the default dimensions
  const finalRowCount = Math.max(maxRow + 1, minRows);
  const finalColCount = Math.max(maxCol + 1, minCols);

  // Create matrix fully populated with nulls
  const data: CellMatrix = [];
  for (let r = 0; r < finalRowCount; r++) {
    const row: Array<FSCell | null> = [];
    for (let c = 0; c < finalColCount; c++) {
      const cell = cells.get(`${r},${c}`);
      row.push(cell ? docforgeCellToFS(cell) : null);
    }
    data.push(row);
  }

  return { data, maxRow: finalRowCount - 1, maxCol: finalColCount - 1 };
}

/**
 * Convert a DocForge Cell to FortuneSheet Cell
 */
function docforgeCellToFS(cell: Cell): FSCell {
  const fsCell: FSCell = {};

  // Value
  if (cell.value !== null && cell.value !== undefined) {
    fsCell.v = cell.value as string | number | boolean;
    fsCell.m = String(cell.value);
  }

  // Formula
  if (cell.formula) {
    fsCell.f = cell.formula.startsWith('=') ? cell.formula.slice(1) : cell.formula;
  }

  // Style
  if (cell.style) {
    Object.assign(fsCell, docforgeStyleToFS(cell.style));
  }

  // Comment
  if (cell.comment) {
    fsCell.ps = {
      left: null,
      top: null,
      width: null,
      height: null,
      value: cell.comment,
      isShow: false,
    };
  }

  return fsCell;
}

/**
 * Convert DocForge CellStyle to FortuneSheet style properties
 */
function docforgeStyleToFS(style: CellStyle): Partial<FSCell> {
  const fsStyle: Partial<FSCell> = {};

  if (style.bold) fsStyle.bl = 1;
  if (style.italic) fsStyle.it = 1;
  if (style.underline) fsStyle.un = 1;
  if (style.strikethrough) fsStyle.cl = 1;
  if (style.fontFamily) fsStyle.ff = style.fontFamily;
  if (style.fontSize) fsStyle.fs = style.fontSize;
  if (style.fontColor) fsStyle.fc = style.fontColor;
  if (style.backgroundColor) fsStyle.bg = style.backgroundColor;

  // Horizontal alignment: 0=center, 1=left, 2=right
  if (style.horizontalAlign === 'left') fsStyle.ht = 1;
  else if (style.horizontalAlign === 'center') fsStyle.ht = 0;
  else if (style.horizontalAlign === 'right') fsStyle.ht = 2;

  // Vertical alignment: 0=middle, 1=top, 2=bottom
  if (style.verticalAlign === 'top') fsStyle.vt = 1;
  else if (style.verticalAlign === 'middle') fsStyle.vt = 0;
  else if (style.verticalAlign === 'bottom') fsStyle.vt = 2;

  return fsStyle;
}

/**
 * Convert FortuneSheet Sheet array to DocForge Workbook
 */
export function fortuneSheetToDocforge(sheets: FSSheet[], title?: string): Workbook {
  const activeIndex = sheets.findIndex((s) => s.status === 1);

  return {
    id: generateId(),
    title: title ?? 'Untitled Spreadsheet',
    sheets: sheets.map((sheet) => fsSheetToDocforge(sheet)),
    activeSheet: activeIndex >= 0 ? activeIndex : 0,
  };
}

/**
 * Convert a FortuneSheet Sheet to DocForge Sheet
 */
function fsSheetToDocforge(fsSheet: FSSheet & { celldata?: CellWithRowAndCol[] }): Sheet {
  // Convert cells - handle both data matrix and celldata array formats
  const cells = new Map<string, Cell>();

  // Try celldata format first (returned by getAllSheets/getSheet)
  if (fsSheet.celldata && fsSheet.celldata.length > 0) {
    for (const cellWithPos of fsSheet.celldata) {
      if (cellWithPos.v) {
        cells.set(`${cellWithPos.r},${cellWithPos.c}`, fsCellToDocforge(cellWithPos.v));
      }
    }
  } else if (fsSheet.data) {
    // Fall back to data matrix format
    const data = fsSheet.data;
    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const fsCell = row[c];
        if (fsCell) {
          cells.set(`${r},${c}`, fsCellToDocforge(fsCell));
        }
      }
    }
  }

  // Convert merges
  const merges: Merge[] = [];
  if (fsSheet.config?.merge) {
    for (const m of Object.values(fsSheet.config.merge)) {
      merges.push({
        startRow: m.r,
        startCol: m.c,
        endRow: m.r + m.rs - 1,
        endCol: m.c + m.cs - 1,
      });
    }
  }

  // Convert row heights
  const rowHeights = new Map<number, number>();
  if (fsSheet.config?.rowlen) {
    for (const [key, value] of Object.entries(fsSheet.config.rowlen)) {
      rowHeights.set(Number(key), value);
    }
  }

  // Convert column widths
  const colWidths = new Map<number, number>();
  if (fsSheet.config?.columnlen) {
    for (const [key, value] of Object.entries(fsSheet.config.columnlen)) {
      colWidths.set(Number(key), value);
    }
  }

  // Convert frozen panes
  let frozenRows = 0;
  let frozenCols = 0;
  if (fsSheet.frozen) {
    if (fsSheet.frozen.type === 'row' || fsSheet.frozen.type === 'both' || fsSheet.frozen.type === 'rangeRow' || fsSheet.frozen.type === 'rangeBoth') {
      frozenRows = (fsSheet.frozen.range?.row_focus ?? 0) + 1;
    }
    if (fsSheet.frozen.type === 'column' || fsSheet.frozen.type === 'both' || fsSheet.frozen.type === 'rangeColumn' || fsSheet.frozen.type === 'rangeBoth') {
      frozenCols = (fsSheet.frozen.range?.column_focus ?? 0) + 1;
    }
  }

  return {
    id: fsSheet.id ?? generateId(),
    name: fsSheet.name,
    cells,
    rowHeights,
    colWidths,
    merges,
    charts: [], // FortuneSheet doesn't have charts in our simplified version
    frozenRows,
    frozenCols,
  };
}

/**
 * Convert a FortuneSheet Cell to DocForge Cell
 */
function fsCellToDocforge(fsCell: FSCell): Cell {
  const cell: Cell = {
    value: fsCell.v as CellValue ?? null,
  };

  // Formula
  if (fsCell.f) {
    cell.formula = `=${fsCell.f}`;
  }

  // Style
  const style = fsStyleToDocforge(fsCell);
  if (Object.keys(style).length > 0) {
    cell.style = style;
  }

  // Comment
  if (fsCell.ps?.value) {
    cell.comment = fsCell.ps.value;
  }

  return cell;
}

/**
 * Convert FortuneSheet cell style properties to DocForge CellStyle
 */
function fsStyleToDocforge(fsCell: FSCell): CellStyle {
  const style: CellStyle = {};

  if (fsCell.bl === 1) style.bold = true;
  if (fsCell.it === 1) style.italic = true;
  if (fsCell.un === 1) style.underline = true;
  if (fsCell.cl === 1) style.strikethrough = true;
  if (fsCell.ff) style.fontFamily = String(fsCell.ff);
  if (fsCell.fs) style.fontSize = fsCell.fs;
  if (fsCell.fc) style.fontColor = fsCell.fc;
  if (fsCell.bg) style.backgroundColor = fsCell.bg;

  // Horizontal alignment
  if (fsCell.ht === 1) style.horizontalAlign = 'left';
  else if (fsCell.ht === 0) style.horizontalAlign = 'center';
  else if (fsCell.ht === 2) style.horizontalAlign = 'right';

  // Vertical alignment
  if (fsCell.vt === 1) style.verticalAlign = 'top';
  else if (fsCell.vt === 0) style.verticalAlign = 'middle';
  else if (fsCell.vt === 2) style.verticalAlign = 'bottom';

  return style;
}

/**
 * Create an empty FortuneSheet data structure
 */
export function createEmptyFortuneSheetData(): FSSheet[] {
  const rows = 100;
  const cols = 26;
  const data: CellMatrix = [];

  for (let r = 0; r < rows; r++) {
    const row: Array<FSCell | null> = [];
    for (let c = 0; c < cols; c++) {
      row.push(null);
    }
    data.push(row);
  }

  return [
    {
      id: generateId(),
      name: 'Sheet1',
      status: 1,
      order: 0,
      data,
      row: rows,
      column: cols,
    },
  ];
}
