export interface ImportConfigValues {
  mode: "insert" | "upsert";
  file: File | null;
}

export interface ImportProgress {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
  validationErrors?: Array<{ row: number; field: string; message: string }>;
}
