import { BaseSubAgent } from './BaseSubAgent';

export class SummarySubAgent extends BaseSubAgent {
  readonly intent = 'SUMMARY';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    if (!metric) throw new Error('Summary requires at least one metric column');

    return this.statEngine.computeSummary(data, metric);
  }
}
