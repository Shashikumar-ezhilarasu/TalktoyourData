import { LocalBaseSubAgent } from './LocalBaseSubAgent';

export class LocalAnomalySubAgent extends LocalBaseSubAgent {
  readonly intent = 'ANOMALY';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    return this.statEngine.computeAnomalies(data, metric);
  }

  protected generateInsight(stats: any, question: string) {
    return {
      headline: `Detected ${stats.totalAnomalyCount} statistical anomalies`,
      metricName: 'Mean Baseline',
      metricValue: stats.mean,
      explanation: `Analysis identifies ${stats.totalAnomalyCount} data points exceeding 2.5 standard deviations from the mean (${stats.mean.toFixed(2)}). The most extreme variance is ${stats.anomalies[0]?.deviationPct}% from the baseline.`,
      chartData: {
        type: 'bar', // Anomaly uses bars for highlights
        labels: stats.anomalies.map((a: any, i: number) => `Point ${i+1}`),
        values: stats.anomalies.map((a: any) => a.value)
      }
    };
  }
}
