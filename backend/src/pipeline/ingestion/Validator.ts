import { z } from 'zod';

export const UploadSchema = z.object({
  filename: z.string(),
  mimetype: z.enum(['text/csv', 'application/json', 'text/plain', 'application/octet-stream']),
  size: z.number().max(50 * 1024 * 1024, 'File must be under 50MB')
});

export class Validator {
  validateMetadata(fileMeta: { filename: string; mimetype: string; size: number }) {
    return UploadSchema.parse(fileMeta);
  }

  validateStructure(rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Dataset is empty or invalid format');
    }
    
    const columnCount = Object.keys(rows[0]).length;
    if (columnCount > 200) {
      throw new Error('Dataset exceeds maximum supported columns (200)');
    }
    
    return true;
  }

  estimateRows(fileSize: number, firstRow: any): number {
    const avgRowSize = JSON.stringify(firstRow).length;
    return Math.floor(fileSize / avgRowSize);
  }
}
