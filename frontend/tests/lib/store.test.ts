import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../../lib/store';

describe('DashboardStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const initialState = useDashboardStore.getState();
    useDashboardStore.setState(initialState, true);
  });

  it('should have initial state', () => {
    const state = useDashboardStore.getState();
    expect(state.dataset).toBeNull();
    expect(state.queries).toEqual([]);
    expect(state.sidebarOpen).toBe(true);
    expect(state.previewExpanded).toBe(false);
    expect(state.activePipeline).toBeNull();
  });

  it('should set dataset', () => {
    const mockDataset = { _id: '1', fileName: 'data.csv', metadata: { rowCount: 100, columnCount: 5, missingValues: 0, columns: [] }, sampleData: [], createdAt: 'now', processingStatus: 'ready' as const, byteSize: 1024, profileStatus: 'completed' as const, authorId: '1' };
    useDashboardStore.getState().setDataset(mockDataset);
    expect(useDashboardStore.getState().dataset).toEqual(mockDataset);
  });

  it('should add query and clear active pipeline', () => {
    // Set active pipeline first to ensure it gets cleared
    useDashboardStore.getState().startPipeline('query-123');
    expect(useDashboardStore.getState().activePipeline).toBeDefined();

    const mockQuery = { _id: 'q1', datasetId: '1', query: 'test', sql: 'SELECT * FROM table', data: [], summary: '', recommendedCharts: [], chartType: 'bar' as const, createdAt: 'now' };
    useDashboardStore.getState().addQuery(mockQuery);
    
    const state = useDashboardStore.getState();
    expect(state.queries).toHaveLength(1);
    expect(state.queries[0]).toEqual(mockQuery);
    // As per store logic: activePipeline is set to null when query is added
    expect(state.activePipeline).toBeNull();
  });

  it('should toggle sidebar', () => {
    const initialSidebarState = useDashboardStore.getState().sidebarOpen;
    useDashboardStore.getState().toggleSidebar();
    expect(useDashboardStore.getState().sidebarOpen).toBe(!initialSidebarState);
    useDashboardStore.getState().toggleSidebar();
    expect(useDashboardStore.getState().sidebarOpen).toBe(initialSidebarState);
  });

  it('should manage pipeline events', () => {
    const queryId = 'query-456';
    useDashboardStore.getState().startPipeline(queryId);
    
    expect(useDashboardStore.getState().activePipeline).toEqual({
      queryId,
      events: [],
      status: 'running'
    });

    const mockEvent = { stage: 'intent', status: 'running' as const, message: 'Processing', timestamp: 'now' };
    useDashboardStore.getState().addPipelineEvent(mockEvent);

    expect(useDashboardStore.getState().activePipeline?.events).toHaveLength(1);
    expect(useDashboardStore.getState().activePipeline?.events[0]).toEqual(mockEvent);
    
    useDashboardStore.getState().clearPipeline();
    expect(useDashboardStore.getState().activePipeline).toBeNull();
  });
});
