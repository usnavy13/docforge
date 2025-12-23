// Command Registry - registers and retrieves command handlers

import type { CommandHandler } from './types';

/**
 * Registry for command handlers
 *
 * @example
 * ```typescript
 * const registry = new CommandRegistry();
 *
 * registry.register('sheet.setCells', async (payload) => {
 *   // Handle setCells command
 *   return { updated: payload.cells.length };
 * });
 *
 * const handler = registry.get('sheet.setCells');
 * ```
 */
export class CommandRegistry {
  private handlers: Map<string, CommandHandler> = new Map();

  /**
   * Register a command handler
   */
  register<TPayload = unknown, TResult = unknown>(
    commandType: string,
    handler: CommandHandler<TPayload, TResult>
  ): void {
    this.handlers.set(commandType, handler as CommandHandler);
  }

  /**
   * Unregister a command handler
   */
  unregister(commandType: string): boolean {
    return this.handlers.delete(commandType);
  }

  /**
   * Get a command handler
   */
  get(commandType: string): CommandHandler | undefined {
    return this.handlers.get(commandType);
  }

  /**
   * Check if a command type is registered
   */
  has(commandType: string): boolean {
    return this.handlers.has(commandType);
  }

  /**
   * Get all registered command types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}
