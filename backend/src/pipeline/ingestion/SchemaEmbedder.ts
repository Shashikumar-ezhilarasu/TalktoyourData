import { getEmbeddingModel } from '../../config/gemini';
import { SchemaEmbedding } from '../../models/SchemaEmbedding.model';
import { IColumnProfile } from '../../models/Dataset.model';
import mongoose from 'mongoose';

export class SchemaEmbedder {
  async embedColumn(datasetId: string, profile: IColumnProfile) {
    const model = getEmbeddingModel();
    const textToEmbed = `${profile.name}: ${profile.type} — sample values: ${profile.sampleValues.join(', ')}`;
    
    try {
      const result = await model.embedContent(textToEmbed);
      const vector = result.embedding.values;

      await SchemaEmbedding.create({
        datasetId: new mongoose.Types.ObjectId(datasetId),
        columnName: profile.name,
        columnType: profile.type,
        embeddingText: textToEmbed,
        vector,
        columnProfile: profile
      });
    } catch (error) {
      console.error(`Failed to embed column ${profile.name}:`, error);
    }
  }

  async embedDataset(datasetId: string, profiles: IColumnProfile[]) {
    // Process columns in parallel with a limit or sequentially for safety
    for (const profile of profiles) {
      await this.embedColumn(datasetId, profile);
    }
  }
}
