import mongoose, { Schema, Document } from 'mongoose';

export interface IDataChunk extends Document {
  datasetId: mongoose.Types.ObjectId;
  chunkIndex: number;
  rows: Record<string, any>[];
  rowStart: number;
  rowEnd: number;
}

const DataChunkSchema = new Schema<IDataChunk>({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  chunkIndex: { type: Number, required: true },
  rows: [{ type: Schema.Types.Mixed }],
  rowStart: { type: Number, required: true },
  rowEnd: { type: Number, required: true }
});

DataChunkSchema.index({ datasetId: 1, chunkIndex: 1 });

export const DataChunk = mongoose.model<IDataChunk>('DataChunk', DataChunkSchema);
