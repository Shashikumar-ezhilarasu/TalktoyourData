import { BaseSubAgent } from './BaseSubAgent';

export class CompareSubAgent extends BaseSubAgent {
  readonly intent = 'COMPARISON';

  protected computeStats(data: any[], resolved: any) {
    const metric = resolved.metricColumns[0]?.columnName;
    const dimension = resolved.dimensionColumns[0]?.columnName;
    
    if (!metric || !dimension) {
        throw new Error('Comparison requires a metric and a dimension');
    }

    return this.statEngine.computeComparison(data, metric, dimension);
  }
}
