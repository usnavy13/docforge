
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as XLSX from 'xlsx';
import { readXlsx, writeXlsx } from './xlsx';
import type { Workbook, Sheet, Cell } from '@docforge/core';

// Mock types since we can't import from @docforge/core easily in this environment if it's not set up perfectly,
// but the file imports it, so it should be fine.
// If not, I'll define local interfaces matching the ones in xlsx.ts

// Mock XLSX module
vi.mock('xlsx', async (importOriginal) => {
    const actual = await importOriginal<typeof import('xlsx')>();
    return {
        ...actual,
        read: vi.fn(actual.read), // Default to actual implementation
    };
});

describe('Bug Reproduction', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Import Issue (Empty Sheets)', () => {
        it('should read data even if !ref is missing', async () => {
            const mockSheet = {
                'A1': { v: 'Name', t: 's' },
                'B1': { v: 'Value', t: 's' },
                'A2': { v: 'A', t: 's' },
                'B2': { v: 1, t: 'n' }
                // No !ref
            };

            const mockWorkbook = {
                SheetNames: ['Sheet1'],
                Sheets: {
                    'Sheet1': mockSheet
                }
            };

            // Mock XLSX.read to return our broken workbook for this test only
            vi.mocked(XLSX.read).mockReturnValueOnce(mockWorkbook as any);

            const buffer = new ArrayBuffer(0); // Dummy buffer
            const result = await readXlsx(buffer);
            const sheet = result.sheets[0];

            console.log('Sheet cells size:', sheet.cells.size);

            expect(sheet.cells.size).toBeGreaterThan(0);
            expect(sheet.cells.get('0,0')?.value).toBe('Name');
        });
    });

    describe('Export Issue (Formulas)', () => {
        it('should preserve formulas in export', async () => {
            const cells = new Map<string, any>(); // Using any for Cell momentarily
            cells.set('A1', { value: 10 });
            cells.set('A2', { value: 20 });
            // Formula cell with leading value
            cells.set('A3', { value: 30, formula: 'SUM(A1:A2)' });
            // Formula with leading =
            cells.set('A4', { value: 30, formula: '=SUM(A1:A2)' });

            const sheet = {
                id: '1',
                name: 'FormulaSheet',
                cells: cells,
                rowHeights: new Map(),
                colWidths: new Map(),
                merges: [],
                charts: [],
                frozenRows: 0,
                frozenCols: 0
            };

            const workbook = {
                id: 'wb1',
                title: 'Test',
                sheets: [sheet],
                activeSheet: 0
            };

            // Write to blob
            const blob = await writeXlsx(workbook as any);
            const buffer = await blob.arrayBuffer();

            // Read back to verify
            const wbRead = XLSX.read(buffer, { type: 'array' });
            const wsRead = wbRead.Sheets['FormulaSheet'];
            const cellA3 = wsRead['A3'];
            const cellA4 = wsRead['A4'];

            console.log('Cell A3 f:', cellA3?.f);
            console.log('Cell A4 f:', cellA4?.f);

            // A3 should be fine
            expect(cellA3.f).toBe('SUM(A1:A2)');

            // A4: If the code doesn't strip '=', SheetJS might interpret it weirdly 
            // OR it might write it as is. 
            // If it writes `f: "=SUM..."`, Excel opens it and sees `==SUM`. 
            // BUT SheetJS parser `read` might strip it back?
            // Let's check what `read` returns. 
            // If it returns '=SUM(...)', then it's wrong because `f` should be pure formula.
            // Actually, let's verify if `f` starts with `=` in the read result.
            // Good formulas usually don't have `=` in `f` property when read by SheetJS.

            if (cellA4.f) {
                expect(cellA4.f).not.toMatch(/^=/);
            }
        });
    });
});
