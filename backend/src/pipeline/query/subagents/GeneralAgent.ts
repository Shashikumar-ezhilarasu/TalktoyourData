import { getFlashModel } from '../../../config/gemini';
import { SubAgentOutput } from './BaseSubAgent';

export class GeneralAgent {
  private model = getFlashModel();

  async execute(question: string, context: string): Promise<SubAgentOutput> {
    const systemPrompt = `
      You are DataLens, a sophisticated data analytical partner.
      The user is asking a personalized or general question about their data or the platform.
      Provide a clear, helpful, and professional response.
      
      Return ONLY a JSON response matching the schema:
      {
        "intent": "GENERAL",
        "headline": "Short professional summary",
        "metricName": "Key Observation",
        "metricValue": 0,
        "changeValue": 0,
        "changeDirection": "none",
        "explanation": "Your detailed answer (3-4 sentences)",
        "chartData": { "type": "pie", "labels": [], "values": [] },
        "suggestedFollowUps": ["Q1", "Q2"],
        "sourceSummary": "Generative Intelligence (Gemini 2.5 Flash)"
      }

      Context for data: ${context}
    `;

    const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + `\nUser Question: ${question}` }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    return JSON.parse(result.response.text());
  }
}
