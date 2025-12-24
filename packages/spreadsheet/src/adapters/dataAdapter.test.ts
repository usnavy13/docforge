import { describe, it, expect } from 'vitest';
import {
  docforgeToFortuneSheet,
  fortuneSheetToDocforge,
  createEmptyFortuneSheetData,
} from './dataAdapter';
import type { Workbook, Sheet, Cell } from '../types';

describe('dataAdapter', () => {
  describe('createEmptyFortuneSheetData', () => {
    it('should create an empty sheet with default name', () => {
      const result = createEmptyFortuneSheetData();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sheet1');
      expect(result[0].data).toEqual([]);
    });
  });

  describe('docforgeToFortuneSheet', () => {
    it('should convert an empty workbook', () => {
      const workbook: Workbook = {
        id: 'wb1',
        title: 'Test Workbook',
        sheets: [],
        activeSheet: 0,
      };

      const result = docforgeToFortuneSheet(workbook);
      expect(result).toEqual([]);
    });

    it('should convert a workbook with a simple sheet', () => {
      // Note: Cells use "row,col" format (e.g., "0,0" for A1)
      const cells = new Map<string, Cell>();
      cells.set('0,0', { value: 'Hello' }); // A1
      cells.set('0,1', { value: 42 }); // B1
      cells.set('1,0', { value: true }); // A2

      const sheet: Sheet = {
        id: 'sheet1',
        name: 'MySheet',
        cells,
        rowHeights: new Map(),
        colWidths: new Map(),
        merges: [],
        charts: [],
        frozenRows: 0,
        frozenCols: 0,
      };

      const workbook: Workbook = {
        id: 'wb1',
        title: 'Test',
        sheets: [sheet],
        activeSheet: 0,
      };

      const result = docforgeToFortuneSheet(workbook);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('MySheet');

      // Check data contains the values (data is a 2D matrix)
      const data = result[0].data;
      expect(data).toBeDefined();

      // Check A1 (row 0, col 0)
      expect(data![0][0]?.v).toBe('Hello');

      // Check B1 (row 0, col 1)
      expect(data![0][1]?.v).toBe(42);

      // Check A2 (row 1, col 0)
      expect(data![1][0]?.v).toBe(true);
    });

    it('should convert cells with formulas', () => {
      const cells = new Map<string, Cell>();
      cells.set('0,0', { value: 10 });
      cells.set('1,0', { value: 20 });
      cells.set('2,0', { value: 30, formula: '=A1+A2' });

      const sheet: Sheet = {
        id: 'sheet1',
        name: 'Sheet1',
        cells,
        rowHeights: new Map(),
        colWidths: new Map(),
        merges: [],
        charts: [],
        frozenRows: 0,
        frozenCols: 0,
      };

      const workbook: Workbook = {
        id: 'wb1',
        title: 'Test',
        sheets: [sheet],
        activeSheet: 0,
      };

      const result = docforgeToFortuneSheet(workbook);
      const data = result[0].data!;
      // Formula is stored without leading '='
      expect(data[2][0]?.f).toBe('A1+A2');
    });

    it('should convert cells with styles', () => {
      const cells = new Map<string, Cell>();
      cells.set('0,0', {
        value: 'Styled',
        style: {
          bold: true,
          italic: true,
          fontSize: 14,
          fontColor: '#FF0000',
          backgroundColor: '#00FF00',
        },
      });

      const sheet: Sheet = {
        id: 'sheet1',
        name: 'Sheet1',
        cells,
        rowHeights: new Map(),
        colWidths: new Map(),
        merges: [],
        charts: [],
        frozenRows: 0,
        frozenCols: 0,
      };

      const workbook: Workbook = {
        id: 'wb1',
        title: 'Test',
        sheets: [sheet],
        activeSheet: 0,
      };

      const result = docforgeToFortuneSheet(workbook);
      const data = result[0].data!;
      expect(data[0][0]?.bl).toBe(1);
      expect(data[0][0]?.it).toBe(1);
      expect(data[0][0]?.fs).toBe(14);
      expect(data[0][0]?.fc).toBe('#FF0000');
      expect(data[0][0]?.bg).toBe('#00FF00');
    });

    it('should convert merges', () => {
      const cells = new Map<string, Cell>();
      cells.set('0,0', { value: 'Merged' });

      const sheet: Sheet = {
        id: 'sheet1',
        name: 'Sheet1',
        cells,
        rowHeights: new Map(),
        colWidths: new Map(),
        merges: [{ startRow: 0, startCol: 0, endRow: 1, endCol: 2 }],
        charts: [],
        frozenRows: 0,
        frozenCols: 0,
      };

      const workbook: Workbook = {
        id: 'wb1',
        title: 'Test',
        sheets: [sheet],
        activeSheet: 0,
      };

      const result = docforgeToFortuneSheet(workbook);
      expect(result[0].config?.merge).toBeDefined();
      expect(result[0].config!.merge!['0_0']).toEqual({
        r: 0,
        c: 0,
        rs: 2,
        cs: 3,
      });
    });
  });

  describe('fortuneSheetToDocforge', () => {
    it('should convert empty FortuneSheet data', () => {
      const result = fortuneSheetToDocforge([]);
      expect(result.sheets).toEqual([]);
      expect(result.title).toBe('Untitled Spreadsheet');
    });

    it('should convert FortuneSheet with cells', () => {
      const fsSheet = {
        name: 'TestSheet',
        data: [
          [{ v: 'Hello', m: 'Hello' }, { v: 42, m: '42' }],
          [{ v: true, m: 'true' }, null],
        ],
      };

      const result = fortuneSheetToDocforge([fsSheet], 'My Workbook');
      expect(result.title).toBe('My Workbook');
      expect(result.sheets).toHaveLength(1);
      expect(result.sheets[0].name).toBe('TestSheet');

      const cells = result.sheets[0].cells;
      // Cells are stored as "row,col"
      expect(cells.get('0,0')?.value).toBe('Hello');
      expect(cells.get('0,1')?.value).toBe(42);
      expect(cells.get('1,0')?.value).toBe(true);
    });

    it('should convert FortuneSheet with formulas', () => {
      const fsSheet = {
        name: 'Sheet1',
        data: [
          [{ v: 10, m: '10' }],
          [{ v: 20, m: '20' }],
          [{ v: 30, f: 'A1+A2', m: '30' }],
        ],
      };

      const result = fortuneSheetToDocforge([fsSheet]);
      const cells = result.sheets[0].cells;
      // Formula is prefixed with '='
      expect(cells.get('2,0')?.formula).toBe('=A1+A2');
      expect(cells.get('2,0')?.value).toBe(30);
    });

    it('should convert FortuneSheet with styles', () => {
      const fsSheet = {
        name: 'Sheet1',
        data: [
          [
            {
              v: 'Styled',
              m: 'Styled',
              bl: 1,
              it: 1,
              fs: 16,
              fc: '#0000FF',
              bg: '#FFFF00',
            },
          ],
        ],
      };

      const result = fortuneSheetToDocforge([fsSheet]);
      const cell = result.sheets[0].cells.get('0,0');
      expect(cell?.style?.bold).toBe(true);
      expect(cell?.style?.italic).toBe(true);
      expect(cell?.style?.fontSize).toBe(16);
      expect(cell?.style?.fontColor).toBe('#0000FF');
      expect(cell?.style?.backgroundColor).toBe('#FFFF00');
    });

    it('should convert FortuneSheet with merges', () => {
      const fsSheet = {
        name: 'Sheet1',
        data: [[{ v: 'Merged', m: 'Merged' }]],
        config: {
          merge: {
            '0_0': { r: 0, c: 0, rs: 2, cs: 3 },
          },
        },
      };

      const result = fortuneSheetToDocforge([fsSheet]);
      const merges = result.sheets[0].merges;
      expect(merges).toHaveLength(1);
      expect(merges[0]).toEqual({
        startRow: 0,
        startCol: 0,
        endRow: 1,
        endCol: 2,
      });
    });

    it('should handle frozen panes', () => {
      const fsSheet = {
        name: 'Sheet1',
        data: [],
        frozen: {
          type: 'rangeBoth',
          range: { row_focus: 2, column_focus: 1 },
        },
      };

      const result = fortuneSheetToDocforge([fsSheet as any]);
      expect(result.sheets[0].frozenRows).toBe(3);
      expect(result.sheets[0].frozenCols).toBe(2);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through round-trip', () => {
      const cells = new Map<string, Cell>();
      cells.set('0,0', { value: 'Name' });
      cells.set('0,1', { value: 'Age' });
      cells.set('1,0', { value: 'Alice' });
      cells.set('1,1', { value: 30 });
      cells.set('2,0', { value: 'Bob' });
      cells.set('2,1', { value: 25 });

      const original: Workbook = {
        id: 'wb1',
        title: 'People',
        sheets: [
          {
            id: 'sheet1',
            name: 'Data',
            cells,
            rowHeights: new Map(),
            colWidths: new Map(),
            merges: [],
            charts: [],
            frozenRows: 0,
            frozenCols: 0,
          },
        ],
        activeSheet: 0,
      };

      // Convert to FortuneSheet and back
      const fsData = docforgeToFortuneSheet(original);
      const result = fortuneSheetToDocforge(fsData, 'People');

      // Verify data is preserved
      expect(result.title).toBe('People');
      expect(result.sheets).toHaveLength(1);
      expect(result.sheets[0].name).toBe('Data');

      const resultCells = result.sheets[0].cells;
      expect(resultCells.get('0,0')?.value).toBe('Name');
      expect(resultCells.get('0,1')?.value).toBe('Age');
      expect(resultCells.get('1,0')?.value).toBe('Alice');
      expect(resultCells.get('1,1')?.value).toBe(30);
      expect(resultCells.get('2,0')?.value).toBe('Bob');
      expect(resultCells.get('2,1')?.value).toBe(25);
    });
  });
});
