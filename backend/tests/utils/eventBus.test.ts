import { queryEventBus } from '../../src/utils/eventBus';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('QueryEventBus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store and immediately replay event history to new subscribers', () => {
    const queryId = 'test-query-1';
    
    queryEventBus.emitEvent(queryId, 'START', { status: 'starting' });

    let receivedHistory: any[] = [];
    queryEventBus.subscribe(queryId, (data) => {
      receivedHistory.push(data);
    });

    expect(receivedHistory).toHaveLength(1);
    expect(receivedHistory[0]).toMatchObject({
      event: 'START',
      data: { status: 'starting' }
    });
    expect(receivedHistory[0].timestamp).toBeDefined();
  });

  it('should emit live events to active subscribers', () => {
    const queryId = 'test-query-2';
    
    let liveEvents: any[] = [];
    queryEventBus.subscribe(queryId, (data) => {
      liveEvents.push(data);
    });

    queryEventBus.emitEvent(queryId, 'PROGRESS', { progress: 50 });
    
    expect(liveEvents).toHaveLength(1);
    expect(liveEvents[0].event).toBe('PROGRESS');
    expect(liveEvents[0].data.progress).toBe(50);
  });

  it('should allow subscribers to unsubscribe successfully', () => {
    const queryId = 'test-query-3';
    
    let received = 0;
    const unsubscribe = queryEventBus.subscribe(queryId, () => { received++ });
    
    queryEventBus.emitEvent(queryId, 'EVENT_1', {});
    expect(received).toBe(1);
    
    unsubscribe();
    
    queryEventBus.emitEvent(queryId, 'EVENT_2', {});
    expect(received).toBe(1); // Should remain 1 because it unsubscribed
  });

  it('should automatically cleanup history after 2 minutes', () => {
    const queryId = 'test-query-cleanup';
    
    queryEventBus.emitEvent(queryId, 'CLEANUP_TEST', {});
    
    let receivedBeforeCleanup = 0;
    queryEventBus.subscribe(queryId, () => { receivedBeforeCleanup++ });
    
    expect(receivedBeforeCleanup).toBe(1);
    
    // Fast forward 2 minutes and 1 second
    vi.advanceTimersByTime(120001);
    
    let receivedAfterCleanup = 0;
    queryEventBus.subscribe(queryId, () => { receivedAfterCleanup++ });
    
    // History should have been cleared, so playing back history results in 0 events
    expect(receivedAfterCleanup).toBe(0);
  });
});
