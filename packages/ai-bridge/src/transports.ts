// Transport layers for AI bridge communication

import type { AICommand, AIResponse } from '@docforge/core';
import { generateId } from '@docforge/core';
import type { TransportOptions } from './types';

/**
 * PostMessage-based transport for iframe communication
 */
export class PostMessageTransport {
  private targetWindow: Window;
  private targetOrigin: string;
  private pendingResponses: Map<
    string,
    {
      resolve: (response: AIResponse) => void;
      reject: (error: Error) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  > = new Map();

  constructor(targetWindow: Window, options?: TransportOptions) {
    this.targetWindow = targetWindow;
    this.targetOrigin = options?.targetOrigin ?? '*';

    // Listen for responses
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * Send a command and wait for response
   */
  async send(command: AICommand, timeout: number = 30000): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(command.id);
        reject(new Error(`Command ${command.id} timed out after ${timeout}ms`));
      }, timeout);

      this.pendingResponses.set(command.id, {
        resolve,
        reject,
        timeout: timeoutId,
      });

      this.targetWindow.postMessage({ type: 'docforge:command', command }, this.targetOrigin);
    });
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data?.type !== 'docforge:response') return;

    const response = event.data.response as AIResponse;
    const pending = this.pendingResponses.get(response.commandId);

    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingResponses.delete(response.commandId);
      pending.resolve(response);
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.pendingResponses.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Transport destroyed'));
    });
    this.pendingResponses.clear();
  }
}

/**
 * Direct transport for in-process communication
 */
export class DirectTransport {
  private executor: { execute: (command: AICommand) => Promise<AIResponse> };

  constructor(executor: { execute: (command: AICommand) => Promise<AIResponse> }) {
    this.executor = executor;
  }

  /**
   * Send a command directly to the executor
   */
  async send(command: AICommand): Promise<AIResponse> {
    return this.executor.execute(command);
  }

  /**
   * Create a command object
   */
  createCommand(type: string, payload: Record<string, unknown>): AICommand {
    return {
      id: generateId(),
      type,
      payload,
      timestamp: Date.now(),
    };
  }
}
