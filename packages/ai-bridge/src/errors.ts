// Error utilities for AI bridge

import type { DocForgeError } from './types';

/**
 * Create a DocForge error object
 */
export function createError(code: string, message: string, details?: unknown): DocForgeError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Check if an object is a DocForge error
 */
export function isDocForgeError(obj: unknown): obj is DocForgeError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj &&
    typeof (obj as DocForgeError).code === 'string' &&
    typeof (obj as DocForgeError).message === 'string'
  );
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  INVALID_COMMAND: 'INVALID_COMMAND',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  INVALID_RANGE: 'INVALID_RANGE',
  INVALID_SLIDE: 'INVALID_SLIDE',
  SHAPE_NOT_FOUND: 'SHAPE_NOT_FOUND',
  SHEET_NOT_FOUND: 'SHEET_NOT_FOUND',
  EXPORT_FAILED: 'EXPORT_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
  TIMEOUT: 'TIMEOUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
