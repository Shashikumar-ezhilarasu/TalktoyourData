import { BaseSubAgent } from './BaseSubAgent';

export class AnomalySubAgent extends BaseSubAgent {
  readonly intent = 'ANOMALY';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    if (!metric) throw new Error('Anomaly detection requires a metric column');

    return this.statEngine.computeAnomalies(data, metric);
  }
}
