import { useState, useEffect } from 'react';
import { useCommandStore } from '../store/useCommandStore';
import { useDownload } from '../hooks/useDownload';
import { Button, StatusMessage } from './common';
import { isValidYouTubeUrl, getUrlValidationError } from '../utils/validation';
import { config } from '../config';

interface FolderOption {
  id: string;
  name: string;
  path: string;
}

export default function CuratorMode() {
  const {
    mode,
    setMode,
    url,
    setUrl,
    format,
    setFormat,
    logs,
    isDownloading,
    error,
    downloadPath,
    setDownloadPath,
    getCommandFlags
  } = useCommandStore();
  const { startDownload, cancelDownload } = useDownload();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [folders, setFolders] = useState<FolderOption[]>([]);

  // Fetch available folders on mount
  useEffect(() => {
    fetch(`${config.apiUrl}/folders`)
      .then(res => res.json())
      .then(data => setFolders(data.folders || []))
      .catch(console.error);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setUrlError(getUrlValidationError(newUrl));
  };

  const handleDownload = () => {
    const validationError = getUrlValidationError(url);
    if (validationError) {
      setUrlError(validationError);
      return;
    }
    setUrlError(null);
    const flags = getCommandFlags();
    startDownload(url, flags);
  };

  const getStatusMessage = (): { message: string; type: 'idle' | 'loading' | 'success' | 'error' | 'info' } => {
    if (error) return { message: error, type: 'error' };
    if (!url.trim()) return { message: 'Paste a YouTube URL to get started', type: 'idle' };
    if (isDownloading) {
      const lastLog = logs[logs.length - 1] || '';
      if (lastLog.includes('[download]')) {
        const match = lastLog.match(/(\d+\.?\d*)%/);
        if (match) return { message: `Downloading... ${match[1]}%`, type: 'loading' };
      }
      return { message: 'Downloading...', type: 'loading' };
    }
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1] || '';
      if (lastLog.includes('waiting') || lastLog.includes('Exit code') || lastLog.includes('already been downloaded')) {
        return { message: 'Download complete!', type: 'success' };
      }
      return { message: lastLog, type: 'info' };
    }
    return { message: 'Ready to download', type: 'idle' };
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setUrlError(getUrlValidationError(text));
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const status = getStatusMessage();
  const canDownload = url.trim() && !isDownloading && isValidYouTubeUrl(url);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-[#111]/10 px-6 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold border-b-2 border-[#111] pb-1 inline-block">Streamline</h1>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-black/5 rounded" aria-label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <span className="text-xs md:text-sm hidden sm:inline">Power User</span>
            <button onClick={() => setMode(mode === 'curator' ? 'terminal' : 'curator')} className="relative w-12 h-6 border border-[#111] bg-white rounded-sm" aria-label="Toggle mode">
              <div className={`absolute top-0 left-0 w-6 h-6 bg-[#111] transition-transform duration-300 ${mode === 'curator' ? 'translate-x-0' : 'translate-x-6'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 md:px-8 py-4 bg-[#f0f0f0] border-b border-[#111]/10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">📂 Download Location</label>
                <select
                  value={downloadPath}
                  onChange={(e) => setDownloadPath(e.target.value)}
                  className="w-full px-4 py-3 border border-[#111]/20 bg-white focus:border-[#111] outline-none text-sm cursor-pointer"
                >
                  <option value="">⚙️ Server Default</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.path}>{folder.name}</option>
                  ))}
                </select>
                {downloadPath && <p className="text-xs text-[#111]/50 mt-1">Path: {downloadPath}</p>}
              </div>
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm border border-[#111]/20 hover:border-[#111]/40">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-xl mx-auto leading-tight">Download YouTube Videos Easily</h2>
          <p className="text-base md:text-lg text-[#111]/70">Paste a link below to get started</p>
        </div>

        <div className="w-full max-w-4xl">
          <div className="relative flex items-center mb-2">
            <input type="text" value={url} onChange={handleUrlChange} placeholder="Paste your YouTube video link here"
              className="flex-1 px-4 md:px-6 py-4 md:py-5 border border-[#111] outline-none text-base md:text-lg pr-12" />
            <button onClick={handlePaste} className="absolute right-3 p-2 hover:bg-black/5 transition-colors" title="Paste">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#111]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {urlError && <p className="text-red-600 text-sm mb-4">{urlError}</p>}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mt-4">
            <div className="flex items-center gap-4">
              <label className="text-base md:text-lg">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as 'video' | 'audio')}
                className="flex-1 sm:flex-none px-4 py-2 border border-[#111] bg-white outline-none cursor-pointer">
                <option value="video">Video (MP4)</option>
                <option value="audio">Audio (MP3)</option>
              </select>
            </div>
            <Button onClick={handleDownload} disabled={!canDownload} variant="primary" size="lg" className="w-full sm:w-auto">
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            {isDownloading && (
              <Button onClick={cancelDownload} variant="secondary" size="lg" className="w-full sm:w-auto">Cancel</Button>
            )}
          </div>
        </div>

        <div className="w-full max-w-4xl mt-8 md:mt-12">
          <StatusMessage message={status.message} type={status.type} />
        </div>
      </main>
    </div>
  );
}
