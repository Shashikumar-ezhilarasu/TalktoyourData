import { getFlashModel } from '../../config/gemini';

export interface IntentResult {
  intent: 'COMPARE' | 'BREAKDOWN' | 'SUMMARY' | 'ANOMALY' | 'GENERAL';
  confidence: number;
  clarificationNeeded: boolean;
  clarificationQuestion: string | null;
  detectedMetrics: string[];
  detectedDimensions: string[];
  detectedTimePeriod?: { type: string; value: string };
}

export class IntentClassifier {
  async classify(question: string, context: string): Promise<IntentResult> {
    const model = getFlashModel();
    
    const systemPrompt = `
      You are a query intent classifier for a data analytics system named DataLens.
      Classify the user's question into EXACTLY ONE intent.

      Intents:
      - COMPARE: comparing two groups, time periods, or products
      - BREAKDOWN: decomposing a total into components/shares
      - SUMMARY: high-level aggregates or periodic reporting
      - ANOMALY: detecting outliers, spikes, or drops
      - GENERAL: generic questions or data exploration

      Rules:
      - If the question is vague, set clarificationNeeded: true and provide a helpful question.
      - detectedMetrics should be IDs from the schema context.
      - Return ONLY a JSON object. No markdown.

      Context:
      ${context}
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + `\nQuestion: ${question}` }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const text = result.response.text();
    
    try {
        // Clean markdown if any
        const cleaned = text.replace(/```json|```/g, '');
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Failed to parse intent JSON:', text);
        throw new Error('Intent classification failed');
    }
  }
}
