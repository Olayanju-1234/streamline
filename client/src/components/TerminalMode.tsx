import { useState, useEffect, useRef } from 'react';
import { useCommandStore } from '../store/useCommandStore';
import { AVAILABLE_FLAGS, TEMPLATE_VARIABLES, TEMPLATE_PRESETS, DEFAULT_OUTPUT_TEMPLATE, FLAG_CATEGORIES } from '../constants';
import { useDownload } from '../hooks/useDownload';
import { Button } from './common';
import { isValidYouTubeUrl, getUrlValidationError } from '../utils/validation';
import { config } from '../config';

interface FolderOption {
  id: string;
  name: string;
  path: string;
}

export default function TerminalMode() {
  const {
    setMode, url, setUrl, flags, toggleFlag, logs, clearLogs, getCommandFlags,
    outputTemplate, setOutputTemplate, downloadPath, setDownloadPath, error
  } = useCommandStore();
  const { startDownload, cancelDownload, isDownloading } = useDownload();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['format', 'quality', 'post-processing']));
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fetch folders
  useEffect(() => {
    fetch(`${config.apiUrl}/folders`)
      .then(res => res.json())
      .then(data => setFolders(data.folders || []))
      .catch(console.error);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setUrlError(getUrlValidationError(e.target.value));
  };

  const handleDownload = async () => {
    const err = getUrlValidationError(url);
    if (err) { setUrlError(err); return; }
    setUrlError(null);
    clearLogs();
    await startDownload(url, getCommandFlags());
  };

  const copyCommand = () => {
    const cmd = `yt-dlp ${getCommandFlags().join(' ')} "${url || '[URL]'}"`;
    navigator.clipboard.writeText(cmd);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canDownload = url.trim() && !isDownloading && isValidYouTubeUrl(url);
  const getCategoryActiveCount = (id: string) => AVAILABLE_FLAGS.filter(f => f.category === id && flags.has(f.flag)).length;

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-sm border-b border-white/10 px-4 md:px-8 py-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[#00FF41] text-xl md:text-2xl font-mono">~~~</div>
            <h1 className="text-xl md:text-2xl font-semibold">Streamline</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button onClick={() => setMode('curator')} variant="secondary" size="sm">Curator</Button>
            <Button onClick={handleDownload} disabled={!canDownload} variant="primary" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
            </Button>
            {isDownloading && (
              <Button onClick={cancelDownload} variant="secondary" size="sm" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}
            <Button onClick={() => setShowSettings(!showSettings)} variant="icon" aria-label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 border border-white/20 bg-[#0a0a0a]">
            <h3 className="text-lg font-semibold mb-4 text-[#00FF41]">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">📂 Download Location</label>
                <select
                  value={downloadPath}
                  onChange={(e) => setDownloadPath(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/20 focus:border-[#00FF41] outline-none text-sm cursor-pointer"
                >
                  <option value="">⚙️ Server Default</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.path}>{folder.name}</option>
                  ))}
                </select>
                {downloadPath && <p className="text-xs text-white/40 mt-1">Path: {downloadPath}</p>}
              </div>
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm border border-white/20 hover:border-white/40">Close</button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Terminal Mode</h2>
          <p className="text-white/60 text-sm">Build custom yt-dlp commands with 45+ options</p>
        </div>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">YouTube URL</label>
          <input type="text" value={url} onChange={handleUrlChange} placeholder="Paste your video or playlist link here"
            className="w-full px-4 py-3 bg-[#050505] border border-white/20 focus:border-[#00FF41] outline-none placeholder:text-white/40" />
          {urlError && <p className="mt-2 text-sm text-red-400">{urlError}</p>}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Command Builder */}
          <div className="xl:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Command Builder</h3>
            <div className="space-y-3">
              {FLAG_CATEGORIES.map(cat => {
                const categoryFlags = AVAILABLE_FLAGS.filter(f => f.category === cat.id);
                const isExpanded = expandedCategories.has(cat.id);
                const activeCount = getCategoryActiveCount(cat.id);
                return (
                  <div key={cat.id} className="border border-white/10 bg-black/20">
                    <button onClick={() => toggleCategory(cat.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-white/60">{cat.label}</span>
                        {activeCount > 0 && <span className="px-2 py-0.5 bg-[#00FF41] text-[#050505] text-xs font-bold rounded-full">{activeCount}</span>}
                      </div>
                      <svg className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {categoryFlags.map(flag => (
                            <button key={flag.id} onClick={() => toggleFlag(flag.flag)} title={flag.description}
                              className={`px-3 py-1.5 text-xs border transition-colors ${flags.has(flag.flag) ? 'bg-[#00FF41] text-[#050505] border-[#00FF41]' : 'bg-[#050505] text-white border-white/20 hover:border-white/40'}`}>
                              {flag.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview & Template */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Live Command Preview</h3>
              <div className="relative bg-[#050505] border border-white/20 p-4 font-mono text-xs">
                <button onClick={copyCommand} className="absolute top-2 right-2 p-1 hover:bg-white/10" title="Copy">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="pr-8 break-all max-h-32 overflow-y-auto">
                  <span className="text-[#00FF41]">yt-dlp</span> <span className="text-white">{getCommandFlags().join(' ')} {url ? `"${url}"` : '[URL]'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Output Template</h3>
                <button onClick={() => setOutputTemplate(DEFAULT_OUTPUT_TEMPLATE)} className="text-xs text-white/40 hover:text-white/60">Reset</button>
              </div>
              <input type="text" value={outputTemplate} onChange={(e) => setOutputTemplate(e.target.value)}
                className="w-full px-4 py-2 bg-[#050505] border border-white/20 focus:border-[#00FF41] outline-none font-mono text-xs" />
              <div className="mt-3">
                <p className="text-xs text-white/40 mb-2">Presets:</p>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setOutputTemplate(p.template)} title={p.description}
                      className="px-2 py-1 border border-white/20 text-xs hover:border-[#00FF41] hover:text-[#00FF41]">{p.name}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-white/40 mb-2">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map(v => (
                    <button key={v.variable} onClick={() => setOutputTemplate(outputTemplate + v.variable)} title={v.description}
                      className="px-2 py-0.5 border border-dashed border-white/20 text-xs hover:border-white/40">{v.variable}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Output Log */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Output Log</h3>
            {logs.length > 0 && <button onClick={clearLogs} className="text-xs text-white/40 hover:text-white/60">Clear</button>}
          </div>
          <div ref={logContainerRef} className="bg-[#050505] border border-white/20 p-4 font-mono text-xs h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-white/40">... waiting for next command</div>
            ) : logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.toLowerCase().includes('error') ? 'text-red-400' : log.includes('[download]') ? 'text-[#00FF41]' : 'text-white/80'}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
