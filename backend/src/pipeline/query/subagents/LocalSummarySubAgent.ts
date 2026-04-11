import { LocalBaseSubAgent } from './LocalBaseSubAgent';

export class LocalSummarySubAgent extends LocalBaseSubAgent {
  readonly intent = 'SUMMARY';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    return this.statEngine.computeSummary(data, metric);
  }

  protected generateInsight(stats: any, question: string) {
    return {
      headline: `Aggregate Overview: ${stats.count} records analyzed`,
      metricName: 'Mean Value',
      metricValue: stats.mean,
      explanation: `The dataset shows a range from ${stats.min} to ${stats.max}. The distribution is ${stats.skewness > 0 ? 'positively' : 'negatively'} skewed with a standard deviation of ${stats.stdDev}.`,
      chartData: {
        type: 'pie',
        labels: ['Min', 'Mean', 'Max'],
        values: [stats.min, stats.mean, stats.max]
      }
    };
  }
}
