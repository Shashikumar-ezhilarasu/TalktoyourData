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
    if (!top) {
        return {
            headline: 'No segments found for breakdown',
            explanation: 'The request for breakdown returned no valid segments from the dataset.',
            chartData: { type: 'bar', labels: [], values: [] }
        };
    }
    
    return {
      headline: `${top.dimension} leads with ${stats.grandTotal > 0 ? ((top.value / stats.grandTotal) * 100).toFixed(1) : 0}% share`,
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
