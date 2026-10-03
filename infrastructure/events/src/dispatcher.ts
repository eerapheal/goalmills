import type { DomainEvent, EventDispatcher, EventHandler } from './types';

export class InMemoryEventDispatcher implements EventDispatcher {
  private handlers = new Map<string, Set<EventHandler<any>>>();

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const set = this.handlers.get(eventType)!;
    set.add(handler as EventHandler<any>);

    return () => {
      set.delete(handler as EventHandler<any>);
    };
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const directHandlers = this.handlers.get(event.eventType);
    const wildcardHandlers = this.handlers.get('*');

    const allHandlers: Array<EventHandler<T>> = [];
    if (directHandlers) {
      allHandlers.push(...directHandlers);
    }
    if (wildcardHandlers) {
      allHandlers.push(...wildcardHandlers);
    }

    const promises = allHandlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventDispatcher] Handler error for event ${event.eventType}:`, err);
      }
    });

    await Promise.allSettled(promises);
  }
}

let defaultDispatcher: InMemoryEventDispatcher | null = null;

export function getSharedEventDispatcher(): InMemoryEventDispatcher {
  if (!defaultDispatcher) {
    defaultDispatcher = new InMemoryEventDispatcher();
  }
  return defaultDispatcher;
}
