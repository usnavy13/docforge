
import { describe, it, expect } from 'vitest';
import { docforgeToFortuneSheet } from './dataAdapter';
import type { Workbook, Sheet, Cell } from '../types';

describe('dataAdapter Sparse Data', () => {
    it('should pad data matrix to minimum dimensions', () => {
        const cells = new Map<string, Cell>();
        cells.set('0,0', { value: 'A1' });

        const sheet: Sheet = {
            id: 's1',
            name: 'Sparse',
            cells,
            rowHeights: new Map(),
            colWidths: new Map(),
            merges: [],
            charts: [],
            frozenRows: 0,
            frozenCols: 0
        };

        const workbook: Workbook = {
            id: 'wb1',
            title: 'Sparse WB',
            sheets: [sheet],
            activeSheet: 0
        };

        const result = docforgeToFortuneSheet(workbook);
        const data = result[0].data;

        // Verify minimum dimensions are respected
        expect(result[0].row).toBeGreaterThanOrEqual(100);
        expect(result[0].column).toBeGreaterThanOrEqual(26);

        // Verify data array is fully populated to match dimensions
        // This is what prevents the "undefined length" crash
        expect(data).toHaveLength(100);
        expect(data[0]).toHaveLength(26);
        expect(data[99]).toHaveLength(26); // Check last row

        // Check content
        expect(data[0][0]?.v).toBe('A1');
        expect(data[0][1]).toBeNull(); // Should be null, not undefined
        expect(data[99][0]).toBeNull();
    });
});
