import { StatisticalEngine } from '../StatisticalEngine';
import { SubAgentOutput } from './BaseSubAgent';

export abstract class LocalBaseSubAgent {
  protected statEngine = new StatisticalEngine();
  abstract readonly intent: string;
  protected abstract computeStats(data: any[], resolved: any): any;
  protected abstract generateInsight(stats: any, question: string): Partial<SubAgentOutput>;

  async execute(data: any[], resolved: any, question: string): Promise<SubAgentOutput> {
    const stats = this.computeStats(data, resolved);
    const insight = this.generateInsight(stats, question);

    return {
      intent: this.intent,
      headline: insight.headline || 'Analysis Complete',
      metricName: insight.metricName || 'Result',
      metricValue: insight.metricValue || 0,
      changeValue: insight.changeValue || 0,
      changeDirection: insight.changeDirection || 'none',
      explanation: insight.explanation || 'Data interpretation based on localized engine.',
      chartData: insight.chartData || { labels: [], values: [] },
      suggestedFollowUps: insight.suggestedFollowUps || [],
      sourceSummary: 'Local Deterministic Engine'
    };
  }
}
