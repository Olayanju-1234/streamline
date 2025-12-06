// Re-export socket types
export * from './socket';

// App-wide types
export type Mode = 'curator' | 'terminal';

export type DownloadFormat = 'video' | 'audio';

export type DownloadStatus = 'idle' | 'downloading' | 'complete' | 'error';

export interface DownloadState {
    status: DownloadStatus;
    progress?: number;
    error?: string;
}
