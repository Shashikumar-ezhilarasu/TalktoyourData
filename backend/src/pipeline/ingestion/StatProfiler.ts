import { IColumnProfile } from '../../models/Dataset.model';
import * as ss from 'simple-statistics';

export interface DatasetStatProfile {
  rowCount: number;
  columnCount: number;
  columns: IColumnProfile[];
  correlationMatrix: Record<string, Record<string, number>>;
  dimensionCardinality: Record<string, number>;
}

export class StatProfiler {
  profile(data: Record<string, any>[], columns: IColumnProfile[]): DatasetStatProfile {
    const rowCount = data.length;
    const columnCount = columns.length;
    const correlationMatrix: Record<string, Record<string, number>> = {};
    const dimensionCardinality: Record<string, number> = {};

    // 1. Dimension Cardinality
    columns.forEach(col => {
      if (col.type === 'category' || col.type === 'string') {
        dimensionCardinality[col.name] = col.uniqueCount;
      }
    });

    // 2. Correlation Matrix for numeric columns
    const numericCols = columns.filter(c => c.type === 'number').map(c => c.name);
    numericCols.forEach(col1 => {
      correlationMatrix[col1] = {};
      numericCols.forEach(col2 => {
        if (col1 === col2) {
          correlationMatrix[col1][col2] = 1;
        } else {
          const series1 = data.map(r => Number(r[col1])).filter(v => !isNaN(v));
          const series2 = data.map(r => Number(r[col2])).filter(v => !isNaN(v));
          
          if (series1.length === series2.length && series1.length > 1) {
              try {
                correlationMatrix[col1][col2] = ss.sampleCorrelation(series1, series2);
              } catch {
                correlationMatrix[col1][col2] = 0;
              }
          } else {
            correlationMatrix[col1][col2] = 0;
          }
        }
      });
    });

    return {
      rowCount,
      columnCount,
      columns,
      correlationMatrix,
      dimensionCardinality
    };
  }
}
