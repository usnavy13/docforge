import { describe, it, expect } from 'vitest';
import { csvToSheet, sheetToCsv } from './xlsx';

// Note: readXlsx and writeXlsx require actual file buffers and are better tested
// in integration tests. Here we test the utility functions.

describe('xlsx utilities', () => {
  describe('csvToSheet', () => {
    it('should convert empty CSV data to empty sheet', () => {
      const result = csvToSheet([]);
      expect(result.name).toBe('Sheet1');
      expect(result.cells.size).toBe(0);
    });

    it('should convert simple CSV data', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['Alice', '30', 'New York'],
        ['Bob', '25', 'Los Angeles'],
      ];

      const result = csvToSheet(data, 'People');
      expect(result.name).toBe('People');

      // Check headers
      expect(result.cells.get('0,0')?.value).toBe('Name');
      expect(result.cells.get('0,1')?.value).toBe('Age');
      expect(result.cells.get('0,2')?.value).toBe('City');

      // Check data - Age should be converted to numbers
      expect(result.cells.get('1,0')?.value).toBe('Alice');
      expect(result.cells.get('1,1')?.value).toBe(30); // Auto-converted to number
      expect(result.cells.get('1,2')?.value).toBe('New York');
    });

    it('should infer numbers from strings', () => {
      const data = [
        ['Value'],
        ['42'],
        ['3.14'],
        ['-100'],
        ['0'],
      ];

      const result = csvToSheet(data);
      expect(result.cells.get('1,0')?.value).toBe(42);
      expect(result.cells.get('2,0')?.value).toBe(3.14);
      expect(result.cells.get('3,0')?.value).toBe(-100);
      expect(result.cells.get('4,0')?.value).toBe(0);
    });

    it('should infer booleans from strings', () => {
      const data = [
        ['Value'],
        ['true'],
        ['false'],
        ['TRUE'],
        ['FALSE'],
      ];

      const result = csvToSheet(data);
      expect(result.cells.get('1,0')?.value).toBe(true);
      expect(result.cells.get('2,0')?.value).toBe(false);
      expect(result.cells.get('3,0')?.value).toBe(true);
      expect(result.cells.get('4,0')?.value).toBe(false);
    });

    it('should skip empty cells', () => {
      const data = [
        ['A', '', 'C'],
        ['', 'B2', ''],
      ];

      const result = csvToSheet(data);
      expect(result.cells.has('0,0')).toBe(true);
      expect(result.cells.has('0,1')).toBe(false); // Empty string skipped
      expect(result.cells.has('0,2')).toBe(true);
      expect(result.cells.has('1,0')).toBe(false);
      expect(result.cells.has('1,1')).toBe(true);
      expect(result.cells.has('1,2')).toBe(false);
    });

    it('should generate unique IDs', () => {
      const sheet1 = csvToSheet([['A']]);
      const sheet2 = csvToSheet([['B']]);
      expect(sheet1.id).not.toBe(sheet2.id);
    });
  });

  describe('sheetToCsv', () => {
    it('should convert empty sheet correctly', () => {
      const sheet = csvToSheet([]);
      const result = sheetToCsv(sheet);
      // Empty sheet with no cells produces a minimal grid
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should convert sheet to CSV data', () => {
      const data = [
        ['Name', 'Age'],
        ['Alice', '30'],
        ['Bob', '25'],
      ];

      const sheet = csvToSheet(data);
      const result = sheetToCsv(sheet);

      // Values are converted to strings
      expect(result[0]).toEqual(['Name', 'Age']);
      expect(result[1]).toEqual(['Alice', '30']);
      expect(result[2]).toEqual(['Bob', '25']);
    });

    it('should handle sparse data', () => {
      const sheet = csvToSheet([
        ['A1', '', 'C1'],
        ['', 'B2', ''],
        ['A3', '', 'C3'],
      ]);

      const result = sheetToCsv(sheet);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(3);
      expect(result[0][0]).toBe('A1');
      expect(result[0][1]).toBe(''); // Empty cells become empty strings
      expect(result[0][2]).toBe('C1');
    });

    it('should convert values to strings', () => {
      const sheet = csvToSheet([
        ['42', 'true', 'hello'],
      ]);

      const result = sheetToCsv(sheet);
      expect(result[0]).toEqual(['42', 'true', 'hello']);
    });
  });

  describe('csvToSheet and sheetToCsv round-trip', () => {
    it('should preserve string data through round-trip', () => {
      const original = [
        ['Name', 'City'],
        ['Alice', 'New York'],
        ['Bob', 'Los Angeles'],
      ];

      const sheet = csvToSheet(original);
      const result = sheetToCsv(sheet);

      // Values are preserved (though types may change to numbers/booleans)
      expect(result[0][0]).toBe('Name');
      expect(result[0][1]).toBe('City');
      expect(result[1][0]).toBe('Alice');
      expect(result[1][1]).toBe('New York');
    });
  });
});
