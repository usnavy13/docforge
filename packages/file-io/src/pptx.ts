// PPTX file operations using PptxGenJS
// TODO: Implement after integrating PptxGenJS

import type { PptxOptions } from './types';

/**
 * Read a PPTX file and return presentation data
 */
export async function readPptx(
  file: File | ArrayBuffer,
  _options?: PptxOptions
): Promise<unknown> {
  // TODO: Implement custom PPTX parser
  console.log('readPptx called with:', file);
  throw new Error('readPptx not yet implemented');
}

/**
 * Write presentation data to PPTX format
 */
export async function writePptx(
  presentation: unknown,
  _options?: PptxOptions
): Promise<Blob> {
  // TODO: Implement using PptxGenJS
  console.log('writePptx called with:', presentation);
  throw new Error('writePptx not yet implemented');
}
