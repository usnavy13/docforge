// @docforge/ai-bridge - AI command protocol for DocForge
// Based on lessons learned from ZetaOffice implementation

export { CommandRegistry } from './CommandRegistry';
export { CommandExecutor } from './CommandExecutor';
export { PostMessageTransport, DirectTransport } from './transports';
export { createError, isDocForgeError } from './errors';

// Re-export core types
export type { AICommand, AIResponse } from '@docforge/core';

// Bridge-specific types
export type { CommandHandler, TransportOptions, DocForgeError } from './types';
