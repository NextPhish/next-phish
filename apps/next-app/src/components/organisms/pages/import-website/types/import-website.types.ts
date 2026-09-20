export interface PreviousImport {
  id: string;
  url: string;
  finalUrl: string | null;
  status: string;
  includeAssets: boolean;
  html: string | null;
  assetDownloaded: number;
  fileCount: number;
  createdAt: Date;
}

export interface ImportState {
  url: string;
  includeAssets: boolean;
  importing: boolean;
  error: string;
  jobId: string | null;
  progress: {
    status: string;
    discovered: number;
    downloaded: number;
    failed: number;
  } | null;
}
