// Command Executor - executes commands using registered handlers

import { EventEmitter, ERROR_CODES, COMMAND_TIMEOUT } from '@docforge/core';
import type { AICommand, AIResponse } from '@docforge/core';
import { CommandRegistry } from './CommandRegistry';
import { createError } from './errors';
import type { BridgeEvents } from './types';

/**
 * Executes AI commands using registered handlers
 *
 * @example
 * ```typescript
 * const registry = new CommandRegistry();
 * const executor = new CommandExecutor(registry);
 *
 * // Register handlers
 * registry.register('sheet.create', async () => ({ documentId: 'abc123' }));
 *
 * // Execute command
 * const response = await executor.execute({
 *   id: 'cmd-1',
 *   type: 'sheet.create',
 *   payload: { title: 'My Spreadsheet' },
 *   timestamp: Date.now(),
 * });
 * ```
 */
export class CommandExecutor extends EventEmitter<BridgeEvents> {
  private registry: CommandRegistry;
  private timeout: number;

  constructor(registry: CommandRegistry, timeout: number = COMMAND_TIMEOUT) {
    super();
    this.registry = registry;
    this.timeout = timeout;
  }

  /**
   * Execute a command
   */
  async execute(command: AICommand): Promise<AIResponse> {
    const startTime = Date.now();

    this.emit('command:received', command);

    try {
      const handler = this.registry.get(command.type);

      if (!handler) {
        const error = createError(
          ERROR_CODES.INVALID_COMMAND,
          `Unknown command type: ${command.type}`
        );
        this.emit('command:error', { command, error });
        return {
          commandId: command.id,
          success: false,
          error,
          duration: Date.now() - startTime,
        };
      }

      // Execute with timeout
      const result = await this.executeWithTimeout(
        handler(command.payload, command),
        this.timeout
      );

      const response: AIResponse = {
        commandId: command.id,
        success: true,
        result,
        duration: Date.now() - startTime,
      };

      this.emit('command:executed', response);
      return response;
    } catch (err) {
      const error = createError(
        ERROR_CODES.INTERNAL_ERROR,
        err instanceof Error ? err.message : 'Unknown error'
      );

      this.emit('command:error', { command, error });

      return {
        commandId: command.id,
        success: false,
        error,
        duration: Date.now() - startTime,
      };
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T> | T,
    timeout: number
  ): Promise<T> {
    if (!(promise instanceof Promise)) {
      return promise;
    }

    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Command timed out after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  }
}
