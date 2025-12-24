
import { describe, it, expect } from 'vitest';
import { createEmptyFortuneSheetData } from './dataAdapter';

describe('dataAdapter Empty Data', () => {
    it('should create fully populated data matrix for empty sheets', () => {
        const result = createEmptyFortuneSheetData();
        const sheet = result[0];

        expect(sheet.row).toBe(100);
        expect(sheet.column).toBe(26);

        // Data should match dimensions
        expect(sheet.data).toHaveLength(100);
        expect(sheet.data[0]).toHaveLength(26);
        expect(sheet.data[0][0]).toBeNull();
    });
});
