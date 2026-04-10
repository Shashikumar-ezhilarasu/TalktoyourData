import { getFlashModel } from '../../config/gemini';
import { StatisticalEngine } from './StatisticalEngine';

export interface SubAgentOutput {
  intent: string;
  headline: string;
  metricName: string;
  metricValue: number;
  changeValue: number;
  changeDirection: string;
  explanation: string;
  chartData: any;
  suggestedFollowUps: string[];
  sourceSummary: string;
}

export abstract class BaseSubAgent {
  protected statEngine = new StatisticalEngine();
  protected model = getFlashModel();

  abstract readonly intent: string;

  protected abstract computeStats(data: any[], resolved: any): any;

  async execute(data: any[], resolved: any, question: string): Promise<SubAgentOutput> {
    const stats = this.computeStats(data, resolved);
    
    const systemPrompt = `
      You are a specialized business analyst. 
      Interpret the following data based on the user's question.
      Return ONLY a JSON response matching the schema below.
      
      Schema:
      {
        "intent": "${this.intent}",
        "headline": "One sentence summary",
        "metricName": "Metric label",
        "metricValue": 0,
        "changeValue": 0,
        "changeDirection": "up|down|flat|none",
        "explanation": "2-3 sentences max in plain English",
        "chartData": { "type": "bar|line|pie", "labels": [], "values": [] },
        "suggestedFollowUps": ["Q1", "Q2"],
        "sourceSummary": "Metadata about query"
      }

      Data to interpret: ${JSON.stringify(stats)}
    `;

    try {
        const result = await this.model.generateContent([systemPrompt, `User Question: ${question}`]);
        const text = result.response.text().trim().replace(/```json|```/g, '');
        return JSON.parse(text);
    } catch (err: any) {
        console.error(`SubAgent ${this.intent} failed:`, err);
        throw new Error(`Analysis failed for ${this.intent}`);
    }
  }
}
