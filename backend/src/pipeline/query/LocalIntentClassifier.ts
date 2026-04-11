import { IntentResult } from './IntentClassifier';

export class LocalIntentClassifier {
  classify(question: string): IntentResult {
    const q = question.toLowerCase();
    
    let intent: IntentResult['intent'] = 'SUMMARY'; // Default
    
    if (q.includes('compare') || q.includes('vs') || q.includes('versus') || q.includes('difference')) {
        intent = 'COMPARE';
    } else if (q.includes('breakdown') || q.includes('parts') || q.includes('share') || q.includes('composition')) {
        intent = 'BREAKDOWN';
    } else if (q.includes('anomaly') || q.includes('outlier') || q.includes('spike') || q.includes('weird') || q.includes('unusual')) {
        intent = 'ANOMALY';
    } else if (q.includes('summary') || q.includes('overview') || q.includes('total')) {
        intent = 'SUMMARY';
    }

    return {
      intent: intent as any,
      confidence: 1.0,
      clarificationNeeded: false,
      clarificationQuestion: null,
      detectedMetrics: [],
      detectedDimensions: []
    };
  }
}
