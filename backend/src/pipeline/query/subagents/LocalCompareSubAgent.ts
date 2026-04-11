import { LocalBaseSubAgent } from './LocalBaseSubAgent';

export class LocalCompareSubAgent extends LocalBaseSubAgent {
  readonly intent = 'COMPARE';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    const dimension = resolved.dimensionColumns[0]?.columnName;
    return this.statEngine.computeComparison(data, metric, dimension);
  }

  protected generateInsight(stats: any, question: string) {
    return {
      headline: `${stats.groupB.label} is ${Math.abs(stats.pctChange)}% ${stats.direction} vs ${stats.groupA.label}`,
      metricName: 'Variance',
      metricValue: stats.pctChange,
      changeValue: stats.pctChange,
      changeDirection: stats.direction,
      explanation: `Statistical comparison shows a ${stats.direction} of ${stats.pctChange}%. The result is ${stats.isStatisticallySignificant ? 'statistically significant' : 'not statistically significant'} with a t-statistic of ${stats.tStatistic.toFixed(2)}.`,
      chartData: {
        type: 'bar',
        labels: [stats.groupA.label, stats.groupB.label],
        values: [stats.groupA.sum, stats.groupB.sum]
      }
    };
  }
}
