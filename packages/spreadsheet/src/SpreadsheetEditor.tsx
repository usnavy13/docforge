/**
 * SpreadsheetEditor - React component wrapping FortuneSheet
 */

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Workbook as FSWorkbook, WorkbookInstance } from '@fortune-sheet/react';
import type { Sheet as FSSheet, Hooks } from '@fortune-sheet/core';
import '@fortune-sheet/react/dist/index.css';

import type { Workbook, Selection, CellEditEvent, ToolbarMode } from './types';
import type { CellStyle, CellRange, CellValue } from '@docforge/core';
import { generateId } from '@docforge/core';
import {
  docforgeToFortuneSheet,
  fortuneSheetToDocforge,
  createEmptyFortuneSheetData,
} from './adapters';

/**
 * Props for the SpreadsheetEditor component
 */
export interface SpreadsheetEditorProps {
  /** Toolbar display mode */
  toolbar?: ToolbarMode;
  /** Read-only mode */
  readOnly?: boolean;
  /** Enable AI command processing */
  aiEnabled?: boolean;
  /** Initial workbook data */
  initialData?: Workbook;
  /** Called when data changes */
  onChange?: (workbook: Workbook) => void;
  /** Called when selection changes */
  onSelectionChange?: (selection: Selection) => void;
  /** Called when a cell is edited */
  onCellEdit?: (event: CellEditEvent) => void;
  /** Language setting */
  lang?: 'en' | 'zh' | 'zh_tw' | 'es';
  /** Show formula bar */
  showFormulaBar?: boolean;
  /** Show sheet tabs */
  showSheetTabs?: boolean;
  /** Show row/column headers */
  showHeaders?: boolean;
  /** Show grid lines */
  showGridLines?: boolean;
  /** Default row count for new sheets */
  defaultRowCount?: number;
  /** Default column count for new sheets */
  defaultColCount?: number;
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Ref methods exposed by SpreadsheetEditor
 */
export interface SpreadsheetEditorRef {
  // Data access
  getData(): Workbook;
  setData(workbook: Workbook): void;
  clear(): void;

  // Cell operations
  getCellValue(sheet: number, row: number, col: number): CellValue;
  setCellValue(sheet: number, row: number, col: number, value: CellValue): void;
  setCellsByRange(sheet: number, range: CellRange, values: CellValue[][]): void;
  getCellStyle(sheet: number, row: number, col: number): CellStyle | null;
  setCellStyle(sheet: number, row: number, col: number, style: CellStyle): void;

  // Selection
  getSelection(): Selection | null;

  // Sheet operations
  addSheet(name?: string): string;
  deleteSheet(index: number): void;
  renameSheet(index: number, name: string): void;
  getActiveSheet(): number;
  setActiveSheet(index: number): void;

  // Row/Column operations
  insertRows(sheet: number, startRow: number, count: number): void;
  deleteRows(sheet: number, startRow: number, count: number): void;
  insertColumns(sheet: number, startCol: number, count: number): void;
  deleteColumns(sheet: number, startCol: number, count: number): void;

  // Export
  exportToXlsx(): Promise<Blob>;
  exportToCsv(sheetIndex?: number): Promise<Blob>;

  // Direct access
  getFortuneSheetData(): FSSheet[];
}

// Define toolbar items for different modes
const MINIMAL_TOOLBAR = [
  'undo',
  'redo',
  '|',
  'format-painter',
  '|',
  'font',
  'font-size',
  '|',
  'bold',
  'italic',
  'underline',
  'strike-through',
  '|',
  'font-color',
  'background',
  '|',
  'horizontal-align',
  'vertical-align',
];

const FULL_TOOLBAR = [
  'undo',
  'redo',
  '|',
  'format-painter',
  'clear-format',
  '|',
  'currency-format',
  'percentage-format',
  'number-decrease',
  'number-increase',
  '|',
  'font',
  'font-size',
  '|',
  'bold',
  'italic',
  'underline',
  'strike-through',
  '|',
  'font-color',
  'background',
  'border',
  'merge-cell',
  '|',
  'horizontal-align',
  'vertical-align',
  'text-wrap',
  'text-rotation',
  '|',
  'freeze',
  'sort',
  'filter',
  'condition-format',
  'data-verification',
];

/**
 * SpreadsheetEditor component
 *
 * @example
 * ```tsx
 * const ref = useRef<SpreadsheetEditorRef>(null);
 *
 * <SpreadsheetEditor
 *   ref={ref}
 *   toolbar="minimal"
 *   onChange={(workbook) => console.log('Changed:', workbook)}
 * />
 *
 * // Programmatic access
 * ref.current?.setCellValue(0, 0, 0, 'Hello');
 * ```
 */
export const SpreadsheetEditor = forwardRef<SpreadsheetEditorRef, SpreadsheetEditorProps>(
  (props, ref) => {
    const {
      toolbar = 'minimal',
      readOnly = false,
      initialData,
      onChange,
      onSelectionChange,
      onCellEdit,
      lang = 'en',
      showFormulaBar = true,
      showSheetTabs = true,
      showHeaders = true,
      showGridLines: _showGridLines = true,
      defaultRowCount = 100,
      defaultColCount = 26,
      className,
      style,
    } = props;

    // FortuneSheet data state
    const [fsData, setFsData] = useState<FSSheet[]>(() =>
      initialData ? docforgeToFortuneSheet(initialData) : createEmptyFortuneSheetData()
    );

    // Track workbook title
    const [workbookTitle, setWorkbookTitle] = useState<string>(
      initialData?.title ?? 'Untitled Spreadsheet'
    );

    // Current selection state
    const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);

    // Ref to FortuneSheet's imperative API
    const fsWorkbookRef = useRef<WorkbookInstance>(null);

    // Toolbar items based on mode
    const toolbarItems = useMemo(() => {
      if (toolbar === 'none') return [];
      if (toolbar === 'minimal') return MINIMAL_TOOLBAR;
      return FULL_TOOLBAR;
    }, [toolbar]);

    // Create hooks for FortuneSheet events
    const hooks: Hooks = useMemo(
      () => ({
        afterUpdateCell: (row, col, oldValue, newValue) => {
          const activeSheet = fsData.findIndex((s) => s.status === 1);
          onCellEdit?.({
            sheet: activeSheet >= 0 ? activeSheet : 0,
            row,
            col,
            oldValue: oldValue as CellValue,
            newValue: newValue as CellValue,
          });
        },
        afterSelectionChange: (sheetId, selection) => {
          const sheetIndex = fsData.findIndex((s) => s.id === sheetId);
          if (selection.row && selection.column) {
            const newSelection: Selection = {
              sheet: sheetIndex >= 0 ? sheetIndex : 0,
              startRow: selection.row[0],
              endRow: selection.row[1],
              startCol: selection.column[0],
              endCol: selection.column[1],
            };
            setCurrentSelection(newSelection);
            onSelectionChange?.(newSelection);
          }
        },
        afterAddSheet: () => {
          // Data will be updated via onChange
        },
        afterDeleteSheet: () => {
          // Data will be updated via onChange
        },
      }),
      [fsData, onCellEdit, onSelectionChange]
    );

    // Handle data changes from FortuneSheet
    const handleChange = useCallback(
      (newData: FSSheet[]) => {
        setFsData(newData);
        onChange?.(fortuneSheetToDocforge(newData, workbookTitle));
      },
      [onChange, workbookTitle]
    );

    // Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          // Get current data from FortuneSheet
          const currentData = fsWorkbookRef.current?.getAllSheets() ?? fsData;
          return fortuneSheetToDocforge(currentData, workbookTitle);
        },

        setData: (workbook: Workbook) => {
          setWorkbookTitle(workbook.title);
          const newData = docforgeToFortuneSheet(workbook);

          // Update: this will add/update the new sheets
          setFsData(newData);
          fsWorkbookRef.current?.updateSheet(newData);

          // Cleanup: delete sheets that were present before but are not in the new data
          // We do this in a timeout to ensure the new sheets are registered and active
          setTimeout(() => {
            if (!fsWorkbookRef.current) return;

            const currentSheets = fsWorkbookRef.current.getAllSheets();
            const newSheetIds = new Set(newData.map(s => s.id));

            // Find sheets to delete (exist in current but not in new)
            // Note: We check currentSheets because some might have been implicitly removed or changed
            currentSheets.forEach(sheet => {
              if (!newSheetIds.has(sheet.id)) {
                try {
                  fsWorkbookRef.current?.deleteSheet({ id: sheet.id });
                } catch (e) {
                  console.warn('Failed to delete old sheet:', sheet.id, e);
                }
              }
            });

            // Ensure proper active sheet logic
            const activeSheetId = newData.find(s => s.status === 1)?.id || newData[0]?.id;
            if (activeSheetId) {
              fsWorkbookRef.current.activateSheet({ id: activeSheetId });
            }
          }, 0);
        },

        clear: () => {
          setWorkbookTitle('Untitled Spreadsheet');
          const emptyData = createEmptyFortuneSheetData();
          setFsData(emptyData);
          fsWorkbookRef.current?.updateSheet(emptyData);
        },

        getCellValue: (sheet, row, col) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return null;
          // Use FortuneSheet's imperative API for current value
          const value = fsWorkbookRef.current?.getCellValue(row, col, {
            id: targetSheet.id,
          });
          return value as CellValue ?? null;
        },

        setCellValue: (sheet, row, col, value) => {
          // Get the sheet ID for the target sheet
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;

          // Check if value is a formula (starts with =)
          const isFormula = typeof value === 'string' && value.startsWith('=');

          if (isFormula) {
            // Set as formula - strip the = prefix and use type: 'f'
            const formula = (value as string).slice(1);
            fsWorkbookRef.current?.setCellValue(row, col, formula, {
              id: targetSheet.id,
              type: 'f',
            });
          } else {
            // Set as regular value
            fsWorkbookRef.current?.setCellValue(row, col, value, {
              id: targetSheet.id,
            });
          }
        },

        setCellsByRange: (sheet, range, values) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;

          // Use FortuneSheet's imperative API
          fsWorkbookRef.current?.setCellValuesByRange(values, {
            row: [range.startRow, range.endRow],
            column: [range.startCol, range.endCol],
          }, {
            id: targetSheet.id,
          });
        },

        getCellStyle: (sheet, row, col) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return null;

          const options = { id: targetSheet.id };
          const style: CellStyle = {};

          const bl = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'bl' });
          const it = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'it' });
          const un = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'un' });
          const ff = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'ff' });
          const fs = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'fs' });
          const fc = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'fc' });
          const bg = fsWorkbookRef.current?.getCellValue(row, col, { ...options, type: 'bg' });

          if (bl === 1) style.bold = true;
          if (it === 1) style.italic = true;
          if (un === 1) style.underline = true;
          if (ff) style.fontFamily = String(ff);
          if (fs) style.fontSize = fs;
          if (fc) style.fontColor = fc;
          if (bg) style.backgroundColor = bg;

          return Object.keys(style).length > 0 ? style : null;
        },

        setCellStyle: (sheet, row, col, style) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;

          const options = { id: targetSheet.id };

          // Apply each style property using FortuneSheet API
          if (style.bold !== undefined) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'bl', style.bold ? 1 : 0, options);
          }
          if (style.italic !== undefined) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'it', style.italic ? 1 : 0, options);
          }
          if (style.underline !== undefined) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'un', style.underline ? 1 : 0, options);
          }
          if (style.fontFamily) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'ff', style.fontFamily, options);
          }
          if (style.fontSize) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'fs', style.fontSize, options);
          }
          if (style.fontColor) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'fc', style.fontColor, options);
          }
          if (style.backgroundColor) {
            fsWorkbookRef.current?.setCellFormat(row, col, 'bg', style.backgroundColor, options);
          }
        },

        getSelection: () => currentSelection,

        addSheet: (name?: string) => {
          const sheetId = generateId();
          // Use FortuneSheet API to add sheet
          fsWorkbookRef.current?.addSheet(sheetId);
          // Rename if name was provided
          if (name) {
            fsWorkbookRef.current?.setSheetName(name, { id: sheetId });
          }
          return sheetId;
        },

        deleteSheet: (index) => {
          const targetSheet = fsData[index];
          if (!targetSheet || fsData.length <= 1) return;
          fsWorkbookRef.current?.deleteSheet({ id: targetSheet.id });
        },

        renameSheet: (index, name) => {
          const targetSheet = fsData[index];
          if (!targetSheet) return;
          fsWorkbookRef.current?.setSheetName(name, { id: targetSheet.id });
        },

        getActiveSheet: () => {
          const index = fsData.findIndex((s) => s.status === 1);
          return index >= 0 ? index : 0;
        },

        setActiveSheet: (index) => {
          const targetSheet = fsData[index];
          if (!targetSheet) return;
          fsWorkbookRef.current?.activateSheet({ id: targetSheet.id });
        },

        insertRows: (sheet, startRow, count) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;
          fsWorkbookRef.current?.insertRowOrColumn('row', startRow, count, 'lefttop', {
            id: targetSheet.id,
          });
        },

        deleteRows: (sheet, startRow, count) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;
          fsWorkbookRef.current?.deleteRowOrColumn('row', startRow, startRow + count - 1, {
            id: targetSheet.id,
          });
        },

        insertColumns: (sheet, startCol, count) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;
          fsWorkbookRef.current?.insertRowOrColumn('column', startCol, count, 'lefttop', {
            id: targetSheet.id,
          });
        },

        deleteColumns: (sheet, startCol, count) => {
          const targetSheet = fsData[sheet];
          if (!targetSheet) return;
          fsWorkbookRef.current?.deleteRowOrColumn('column', startCol, startCol + count - 1, {
            id: targetSheet.id,
          });
        },

        exportToXlsx: async () => {
          // TODO: Implement via @docforge/file-io
          throw new Error('exportToXlsx not yet implemented');
        },

        exportToCsv: async (_sheetIndex?: number) => {
          // TODO: Implement via @docforge/file-io
          throw new Error('exportToCsv not yet implemented');
        },

        getFortuneSheetData: () => fsWorkbookRef.current?.getAllSheets() ?? fsData,
      }),
      [fsData, workbookTitle, currentSelection, defaultRowCount, defaultColCount]
    );

    // Update fsData when initialData changes
    useEffect(() => {
      if (initialData) {
        setWorkbookTitle(initialData.title);
        setFsData(docforgeToFortuneSheet(initialData));
      }
    }, [initialData]);

    return (
      <div
        className={`docforge-spreadsheet ${className ?? ''}`}
        style={{
          width: '100%',
          height: '100%',
          ...style,
        }}
      >
        <FSWorkbook
          ref={fsWorkbookRef}
          data={fsData}
          onChange={handleChange}
          lang={lang}
          hooks={hooks}
          allowEdit={!readOnly}
          showToolbar={toolbar !== 'none'}
          toolbarItems={toolbarItems}
          showFormulaBar={showFormulaBar}
          showSheetTabs={showSheetTabs}
          rowHeaderWidth={showHeaders ? 46 : 0}
          columnHeaderHeight={showHeaders ? 20 : 0}
          row={defaultRowCount}
          column={defaultColCount}
        />
      </div>
    );
  }
);

SpreadsheetEditor.displayName = 'SpreadsheetEditor';
