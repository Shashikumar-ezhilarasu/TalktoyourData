import { BaseSubAgent } from './BaseSubAgent';

export class BreakdownSubAgent extends BaseSubAgent {
  readonly intent = 'BREAKDOWN';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    const dimension = resolved.dimensionColumns[0]?.columnName;
    
    if (!metric || !dimension) {
        throw new Error('Breakdown requires both a metric and a dimension column');
    }

    return this.statEngine.computeBreakdown(data, metric, dimension);
  }
}
