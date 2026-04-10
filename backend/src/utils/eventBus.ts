import { EventEmitter } from 'events';

class QueryEventBus extends EventEmitter {
  private eventHistory = new Map<string, any[]>();

  emitEvent(queryId: string, event: string, data: any) {
    const payload = { event, data, timestamp: new Date().toISOString() };
    
    // Store history
    if (!this.eventHistory.has(queryId)) {
        this.eventHistory.set(queryId, []);
    }
    this.eventHistory.get(queryId)!.push(payload);
    
    this.emit(`query:${queryId}`, payload);

    // Auto-cleanup history after 2 minutes
    setTimeout(() => {
        this.eventHistory.delete(queryId);
    }, 120000);
  }

  subscribe(queryId: string, callback: (data: any) => void) {
    const handler = (data: any) => callback(data);
    
    // Replay history immediately
    const history = this.eventHistory.get(queryId) || [];
    history.forEach(payload => callback(payload));

    this.on(`query:${queryId}`, handler);
    return () => this.off(`query:${queryId}`, handler);
  }
}

export const queryEventBus = new QueryEventBus();
