import mongoose from 'mongoose';
import { getEmbeddingModel } from '../../config/gemini';
import { SchemaEmbedding } from '../../models/SchemaEmbedding.model';

export class SchemaResolverAgent {
  async resolve(datasetId: string, question: string) {
    const embedder = getEmbeddingModel();
    
    // 1. Vector Search
    const queryResult = await embedder.embedContent(question);
    const vector = queryResult.embedding.values;

    const vectorResults = await SchemaEmbedding.aggregate([
      {
        $vectorSearch: {
          index: 'schema_vector_index',
          path: 'vector',
          queryVector: vector,
          numCandidates: 50,
          limit: 10,
          filter: { datasetId: new mongoose.Types.ObjectId(datasetId) }
        }
      },
      { $addFields: { vectorScore: { $meta: 'vectorSearchScore' } } }
    ]);

    // 2. Lexical Match (Basic implementation for BM25-like behavior)
    const keywords = question.toLowerCase().split(/\W+/);
    const lexicalResults = await SchemaEmbedding.find({
        datasetId: new mongoose.Types.ObjectId(datasetId),
        columnName: { $in: keywords.map(k => new RegExp(k, 'i')) }
    }).limit(10);

    // 3. RRF Merge
    const merged = this.reciprocalRankFusion(vectorResults, lexicalResults);

    return {
      metricColumns: merged.filter(c => c.columnProfile.likelyMetric).slice(0, 3),
      dimensionColumns: merged.filter(c => c.columnProfile.likelyDimension).slice(0, 3),
      dateColumns: merged.filter(c => c.columnProfile.likelyDateColumn).slice(0, 1)
    };
  }

  private reciprocalRankFusion(vectorResults: any[], lexicalResults: any[], k = 60) {
    const scores = new Map<string, { doc: any; score: number }>();

    vectorResults.forEach((doc, idx) => {
      const id = doc.columnName;
      scores.set(id, { doc, score: (scores.get(id)?.score || 0) + 1 / (k + idx + 1) });
    });

    lexicalResults.forEach((doc, idx) => {
      const id = doc.columnName;
      scores.set(id, { doc, score: (scores.get(id)?.score || 0) + 1 / (k + idx + 1) });
    });

    return Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .map(s => s.doc);
  }
}
