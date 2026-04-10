import mongoose, { Schema, Document } from 'mongoose';

export interface IColumnProfile {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'category';
  nullCount: number;
  nullPct: number;
  uniqueCount: number;
  sampleValues: any[];
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  minDate?: string;
  maxDate?: string;
  detectedFormat?: string;
  categories?: string[];
  likelyMetric?: boolean;
  likelyDimension?: boolean;
  likelyDateColumn?: boolean;
}

const ColumnProfileSchema = new Schema<IColumnProfile>({
  name: String,
  type: { type: String, enum: ['number', 'string', 'date', 'boolean', 'category'] },
  nullCount: Number,
  nullPct: Number,
  uniqueCount: Number,
  sampleValues: [Schema.Types.Mixed],
  min: Number,
  max: Number,
  mean: Number,
  stdDev: Number,
  minDate: String,
  maxDate: String,
  detectedFormat: String,
  categories: [String],
  likelyMetric: Boolean,
  likelyDimension: Boolean,
  likelyDateColumn: Boolean
});

export interface IDataset extends Document {
  name: string;
  filename: string;
  uploadedAt: Date;
  rowCount: number;
  columnCount: number;
  headers: string[];
  columnProfiles: IColumnProfile[];
  statProfile: any;
  piiColumnsRedacted: string[];
  isChunked: boolean;
  chunkCount: number;
  processingStatus: 'pending' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  sampleRows: any[][];
}

const DatasetSchema = new Schema<IDataset>({
  name: { type: String, required: true },
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
  rowCount: Number,
  columnCount: Number,
  headers: [String],
  columnProfiles: [ColumnProfileSchema],
  statProfile: { type: Schema.Types.Mixed, default: {} },
  piiColumnsRedacted: [String],
  isChunked: { type: Boolean, default: false },
  chunkCount: { type: Number, default: 0 },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'error'],
    default: 'pending'
  },
  errorMessage: String,
  sampleRows: { type: [[Schema.Types.Mixed]], default: [] }
});

DatasetSchema.index({ uploadedAt: -1 });
DatasetSchema.index({ processingStatus: 1 });

export const Dataset = mongoose.model<IDataset>('Dataset', DatasetSchema);
