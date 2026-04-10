import * as ss from 'simple-statistics';
import * as math from 'mathjs';

export interface CompareStats {
  groupA: { label: string; sum: number; mean: number; count: number };
  groupB: { label: string; sum: number; mean: number; count: number };
  pctChange: number;
  direction: 'up' | 'down';
  isStatisticallySignificant: boolean;
  effectSize: number;
  tStatistic: number;
}

export interface BreakdownStats {
  segments: { dimension: string; value: number; count: number; mean: number; share: number; cumulativeShare: number }[];
  grandTotal: number;
  topContributor: any;
  concentrationIndex: number;
  isHighlyConcentrated: boolean;
  paretoSegmentCount: number;
}

export interface AnomalyStats {
  anomalies: any[];
  totalAnomalyCount: number;
  mean: number;
  stdDev: number;
  upperBound: number;
  lowerBound: number;
  iqrAnomalyCount: number;
  normalRange: { q1: number; q3: number; iqr: number };
}

export class StatisticalEngine {
  
  extractNumeric(data: any[], metricCol: string, dimensionCol: string, groupLabel: string): number[] {
    return data
      .filter(row => String(row[dimensionCol]) === groupLabel)
      .map(row => Number(row[metricCol]))
      .filter(val => !isNaN(val));
  }

  computeComparison(
    data: any[],
    metricCol: string,
    dimensionCol: string,
    groupA: string,
    groupB: string
  ): CompareStats {
    const groupAValues = this.extractNumeric(data, metricCol, dimensionCol, groupA);
    const groupBValues = this.extractNumeric(data, metricCol, dimensionCol, groupB);
    
    if (groupAValues.length === 0 || groupBValues.length === 0) {
        throw new Error('One or both groups have no data');
    }

    const sumA = ss.sum(groupAValues);
    const sumB = ss.sum(groupBValues);
    const pctChange = ((sumB - sumA) / sumA) * 100;
    
    // Welch's t-test
    const tTest = ss.tTestTwoSample(groupAValues, groupBValues, 0);
    const isStatisticallySignificant = Math.abs(tTest) > 1.96; 
    
    const varA = ss.variance(groupAValues);
    const varB = ss.variance(groupBValues);
    const pooledStd = Math.sqrt((varA + varB) / 2);
    const cohensD = (ss.mean(groupBValues) - ss.mean(groupAValues)) / (pooledStd || 1);
    
    return {
      groupA: { label: groupA, sum: sumA, mean: ss.mean(groupAValues), count: groupAValues.length },
      groupB: { label: groupB, sum: sumB, mean: ss.mean(groupBValues), count: groupBValues.length },
      pctChange: Math.round(pctChange * 100) / 100,
      direction: pctChange >= 0 ? 'up' : 'down',
      isStatisticallySignificant,
      effectSize: cohensD,
      tStatistic: tTest
    };
  }

  computeBreakdown(data: any[], metricCol: string, dimensionCol: string): BreakdownStats {
    const groups = new Map<string, number[]>();
    for (const row of data) {
      const dim = String(row[dimensionCol] ?? 'Unknown');
      const val = Number(row[metricCol]);
      if (!isNaN(val)) {
        if (!groups.has(dim)) groups.set(dim, []);
        groups.get(dim)!.push(val);
      }
    }
    
    const totals = Array.from(groups.entries()).map(([dim, vals]) => ({
      dimension: dim,
      value: ss.sum(vals),
      count: vals.length,
      mean: ss.mean(vals)
    })).sort((a, b) => b.value - a.value);
    
    const grandTotal = ss.sum(totals.map(t => t.value));
    const shares = totals.map(t => t.value / (grandTotal || 1));
    const hhi = ss.sum(shares.map(s => s * s));
    
    let cumulative = 0;
    const withShares = totals.map(t => {
      const share = Math.round((t.value / (grandTotal || 1)) * 10000) / 100;
      cumulative += share;
      return {
        ...t,
        share,
        cumulativeShare: Math.round(cumulative * 100) / 100
      };
    });
    
    const paretoThreshold = withShares.findIndex(t => t.cumulativeShare >= 80) + 1;
    
    return {
      segments: withShares,
      grandTotal,
      topContributor: withShares[0],
      concentrationIndex: hhi,
      isHighlyConcentrated: hhi > 0.25,
      paretoSegmentCount: paretoThreshold > 0 ? paretoThreshold : withShares.length,
    };
  }

  computeAnomalies(data: any[], metricCol: string, dateCol?: string): AnomalyStats {
    const values = data.map(r => Number(r[metricCol])).filter(v => !isNaN(v));
    if (values.length === 0) throw new Error('No numeric data for anomaly detection');

    const mean = ss.mean(values);
    const stdDev = ss.standardDeviation(values);
    
    const anomalies = data.filter(row => {
      const val = Number(row[metricCol]);
      const zScore = (val - mean) / (stdDev || 1);
      return Math.abs(zScore) > 2.5;
    }).map(row => {
      const val = Number(row[metricCol]);
      const zScore = (val - mean) / (stdDev || 1);
      return {
        row,
        value: val,
        zScore: Math.round(zScore * 100) / 100,
        direction: zScore > 0 ? 'spike' : 'dip',
        deviationPct: Math.round(((val - mean) / (mean || 1)) * 10000) / 100,
        date: dateCol ? row[dateCol] : undefined
      };
    }).sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
    
    const q1 = ss.quantile(values, 0.25);
    const q3 = ss.quantile(values, 0.75);
    const iqr = q3 - q1;
    const iqrAnomalyCount = values.filter(v => v < q1 - 1.5*iqr || v > q3 + 1.5*iqr).length;
    
    return {
      anomalies: anomalies.slice(0, 10),
      totalAnomalyCount: anomalies.length,
      mean,
      stdDev,
      upperBound: mean + 2.5*stdDev,
      lowerBound: mean - 2.5*stdDev,
      iqrAnomalyCount,
      normalRange: { q1, q3, iqr }
    };
  }
}
