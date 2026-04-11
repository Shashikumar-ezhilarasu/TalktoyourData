import mongoose from 'mongoose';
import { SchemaEmbedding } from '../../models/SchemaEmbedding.model';

export class LocalSchemaResolver {
  async resolve(datasetId: string, question: string) {
    const columns = await SchemaEmbedding.find({ 
        datasetId: new mongoose.Types.ObjectId(datasetId) 
    });
    
    const q = question.toLowerCase();
    
    // Fuzzy match with numeric validation
    const foundMetrics = columns
        .filter(c => c.columnProfile.likelyMetric && q.includes(c.columnName.toLowerCase()))
        .map(c => c);
        
    const foundDimensions = columns
        .filter(c => c.columnProfile.likelyDimension && q.includes(c.columnName.toLowerCase()))
        .map(c => c);

    // Fallback: If no metrics found in question, take the first REAL numeric metric
    const metricColumns = foundMetrics.length > 0 
        ? foundMetrics 
        : columns.filter(c => c.columnProfile.likelyMetric && c.columnProfile.type === 'number').slice(0, 1);

    const dimensionColumns = foundDimensions.length > 0
        ? foundDimensions
        : columns.filter(c => c.columnProfile.likelyDimension).slice(0, 1);

    return {
      metricColumns,
      dimensionColumns,
      dateColumns: columns.filter(c => c.columnProfile.likelyDateColumn).slice(0, 1)
    };
  }
}
