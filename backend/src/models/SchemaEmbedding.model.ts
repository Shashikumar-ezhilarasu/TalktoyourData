import mongoose, { Schema, Document } from 'mongoose';

export interface ISchemaEmbedding extends Document {
  datasetId: mongoose.Types.ObjectId;
  columnName: string;
  columnType: string;
  embeddingText: string;
  vector: number[];
  columnProfile: any;
}

const SchemaEmbeddingSchema = new Schema<ISchemaEmbedding>({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  columnName: { type: String, required: true },
  columnType: { type: String, required: true },
  embeddingText: { type: String, required: true },
  vector: { type: [Number], required: true }, // Index this in Atlas as 'vectorSearch'
  columnProfile: { type: Schema.Types.Mixed }
});

SchemaEmbeddingSchema.index({ datasetId: 1, columnName: 1 });

export const SchemaEmbedding = mongoose.model<ISchemaEmbedding>('SchemaEmbedding', SchemaEmbeddingSchema);
