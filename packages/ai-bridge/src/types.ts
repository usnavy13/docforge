// Types for @docforge/ai-bridge

import type { AICommand, AIResponse } from '@docforge/core';

/**
 * Handler function for a specific command type
 */
export type CommandHandler<TPayload = unknown, TResult = unknown> = (
  payload: TPayload,
  command: AICommand
) => Promise<TResult> | TResult;

/**
 * Options for transport layer
 */
export interface TransportOptions {
  targetOrigin?: string;
  timeout?: number;
}

/**
 * DocForge-specific error
 */
export interface DocForgeError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Event types emitted by the bridge
 */
export interface BridgeEvents {
  [key: string]: unknown;
  'command:received': AICommand;
  'command:executed': AIResponse;
  'command:error': { command: AICommand; error: DocForgeError };
}
