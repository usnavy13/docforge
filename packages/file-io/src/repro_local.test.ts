
import { describe, it, expect } from 'vitest';
import { readXlsx } from './xlsx';
import fs from 'fs';
import path from 'path';
import { docforgeToFortuneSheet } from '../../spreadsheet/src/adapters/dataAdapter'; // Cross-package import for repro

describe('User File Reproduction', () => {
    it('should read test_data.xlsx without error and produce valid FortuneSheet data', async () => {
        const filePath = path.join(__dirname, 'test_data.xlsx');
        const buffer = fs.readFileSync(filePath);

        // 1. Test Import
        console.log('Reading file...');
        const workbook = await readXlsx(buffer);
        console.log('Workbook sheets:', workbook.sheets.map(s => s.name));

        expect(workbook.sheets.length).toBeGreaterThan(0);
        const firstSheet = workbook.sheets[0];
        console.log('First sheet cells count:', firstSheet.cells.size);

        const keys = Array.from(firstSheet.cells.keys());
        fs.writeFileSync(path.join(__dirname, 'keys_dump.json'), JSON.stringify(keys, null, 2));

        // Check for NaN keys
        for (const key of firstSheet.cells.keys()) {
            const [r, c] = key.split(',').map(Number);
            if (isNaN(r) || isNaN(c)) {
                console.error('Found invalid key:', key);
            }
        }

        // 2. Test Conversion to FortuneSheet (Simulate the crash location)
        console.log('Converting to FortuneSheet...');
        const fsData = docforgeToFortuneSheet(workbook);

        expect(fsData).toHaveLength(workbook.sheets.length);
        const fsSheet = fsData[0];

        console.log('FS Sheet dimensions:', { row: fsSheet.row, col: fsSheet.column });
        console.log('FS Data length:', fsSheet.data.length);

        // Verify data integrity
        expect(fsSheet.data).toHaveLength(fsSheet.row);

        // Check for actual data content
        let nonNullCount = 0;
        fsSheet.data.forEach((row, i) => {
            // Original check for row definition and length
            if (!row) console.error(`Row ${i} is undefined!`);
            expect(row).toBeDefined();
            expect(row).toHaveLength(fsSheet.column);

            // New check for non-null cells
            row.forEach(cell => {
                if (cell !== null) nonNullCount++;
            });
        });

        console.log('Non-null cells found:', nonNullCount);
        expect(nonNullCount).toBeGreaterThan(0);
        expect(nonNullCount).toBe(firstSheet.cells.size);
    });
});
