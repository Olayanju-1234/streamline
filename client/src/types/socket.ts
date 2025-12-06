export interface DownloadLogEvent {
  type: 'stdout' | 'stderr' | 'complete' | 'error';
  data: string;
}

export interface StartDownloadData {
  url: string;
  flags: string[];
  downloadPath?: string;
}
