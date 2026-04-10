import { EventEmitter } from 'events';

class QueryEventBus extends EventEmitter {
  emitEvent(queryId: string, event: string, data: any) {
    this.emit(`query:${queryId}`, { event, data, timestamp: new Date().toISOString() });
  }

  subscribe(queryId: string, callback: (data: any) => void) {
    const handler = (data: any) => callback(data);
    this.on(`query:${queryId}`, handler);
    return () => this.off(`query:${queryId}`, handler);
  }
}

export const queryEventBus = new QueryEventBus();
