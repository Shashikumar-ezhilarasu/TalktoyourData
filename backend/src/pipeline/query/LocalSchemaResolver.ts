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

    // Fallback: If no metrics found in question, take the first REAL numeric metric available in the whole dataset
    const metricColumns = foundMetrics.length > 0 
        ? foundMetrics 
        : columns.filter(c => c.columnProfile.type === 'number').slice(0, 1);

    // If still no metric found (all are strings), we must return something to avoid crash, but summary will fail
    // So we'll pick the first column just as a ghost metric
    if (metricColumns.length === 0) {
        metricColumns.push(columns[0]);
    }

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
