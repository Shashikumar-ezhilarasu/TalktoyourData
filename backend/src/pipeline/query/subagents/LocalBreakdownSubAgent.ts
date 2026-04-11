import { LocalBaseSubAgent } from './LocalBaseSubAgent';

export class LocalBreakdownSubAgent extends LocalBaseSubAgent {
  readonly intent = 'BREAKDOWN';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    const dimension = resolved.dimensionColumns[0]?.columnName;
    return this.statEngine.computeBreakdown(data, metric, dimension);
  }

  protected generateInsight(stats: any, question: string) {
    const top = stats.topContributor;
    return {
      headline: `${top.dimension} leads with ${top.share}% share`,
      metricName: 'Grand Total',
      metricValue: stats.grandTotal,
      explanation: `Analysis of ${stats.segments.length} segments shows high concentration in ${top.dimension}. The top contributor accounts for ${top.value.toLocaleString()} units.`,
      chartData: {
        type: 'bar',
        labels: stats.segments.slice(0, 5).map((s: any) => s.dimension),
        values: stats.segments.slice(0, 5).map((s: any) => s.value)
      },
      changeDirection: 'none'
    };
  }
}
