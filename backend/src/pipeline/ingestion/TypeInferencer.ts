import { IColumnProfile } from '../../models/Dataset.model';
import * as ss from 'simple-statistics';

export class TypeInferencer {
  infer(data: Record<string, any>[]): IColumnProfile[] {
    if (data.length === 0) return [];

    const columns = Object.keys(data[0]);
    const profiles: IColumnProfile[] = [];

    for (const col of columns) {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
      const uniqueValues = new Set(values);
      const nullCount = data.length - values.length;

      let type: 'number' | 'string' | 'date' | 'boolean' | 'category' = 'string';
      
      // Basic type detection
      const isBoolean = values.every(v => typeof v === 'boolean' || ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase()));
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
      const isNumeric = numericValues.length > values.length * 0.8;
      
      const dateValues = values.map(v => Date.parse(String(v))).filter(v => !isNaN(v));
      const isDate = dateValues.length > values.length * 0.8;

      if (isBoolean) type = 'boolean';
      else if (isNumeric) type = 'number';
      else if (isDate) type = 'date';
      else if (uniqueValues.size < 20 && uniqueValues.size > 0) type = 'category';

      const profile: IColumnProfile = {
        name: col,
        type,
        nullCount,
        nullPct: (nullCount / data.length) * 100,
        uniqueCount: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
        likelyMetric: type === 'number' && !col.toLowerCase().includes('id'),
        likelyDimension: type === 'category' || (type === 'string' && uniqueValues.size < 100),
        likelyDateColumn: type === 'date'
      };

      if (type === 'number' && numericValues.length > 0) {
        profile.min = ss.min(numericValues);
        profile.max = ss.max(numericValues);
        profile.mean = ss.mean(numericValues);
        profile.stdDev = ss.standardDeviation(numericValues);
      }

      profiles.push(profile);
    }

    return profiles;
  }
}
