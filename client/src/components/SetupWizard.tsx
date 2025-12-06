import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

interface DependencyStatus {
    installed: boolean;
    version?: string;
}

interface ValidationResult {
    ytdlp: DependencyStatus;
    ffmpeg: DependencyStatus;
    canAutoInstall: boolean;
    packageManager: string | null;
    platform: string;
}

interface SetupWizardProps {
    validation: ValidationResult;
    onComplete: () => void;
}

interface InstallLog {
    type: 'info' | 'stdout' | 'stderr' | 'complete' | 'error';
    data: string;
    version?: string;
}

export default function SetupWizard({ validation, onComplete }: SetupWizardProps) {
    const [installing, setInstalling] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [installedDeps, setInstalledDeps] = useState<Set<string>>(new Set());
    const [installLogs, setInstallLogs] = useState<InstallLog[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [installLogs]);

    // Socket event listener for install logs
    useEffect(() => {
        const socket = getSocket();

        const handleInstallLog = (event: InstallLog) => {
            setInstallLogs(prev => [...prev, event]);

            if (event.type === 'complete') {
                if (installing) {
                    setInstalledDeps(prev => new Set([...prev, installing]));
                }
                setInstalling(null);
            } else if (event.type === 'error') {
                setError(event.data);
                setInstalling(null);
            }
        };

        socket.on('install-log', handleInstallLog);

        return () => {
            socket.off('install-log', handleInstallLog);
        };
    }, [installing]);

    const installDependency = (dep: 'yt-dlp' | 'ffmpeg') => {
        const socket = getSocket();

        if (!socket.connected) {
            setError('Not connected to server. Please refresh the page.');
            return;
        }

        setInstalling(dep);
        setError(null);
        setInstallLogs([{ type: 'info', data: `Starting installation of ${dep}...` }]);

        socket.emit('install-dependency', { dependency: dep });
    };

    const ytdlpReady = validation.ytdlp.installed || installedDeps.has('yt-dlp');
    const ffmpegReady = validation.ffmpeg.installed || installedDeps.has('ffmpeg');
    const allReady = ytdlpReady && ffmpegReady;

    const getManualInstructions = () => {
        switch (validation.platform) {
            case 'darwin':
                return (
                    <div className="text-sm text-white/60 mt-4 p-4 border border-white/10 bg-black/30">
                        <p className="font-semibold mb-2">Manual Installation (macOS):</p>
                        <code className="block bg-black/50 p-2 my-1">brew install yt-dlp ffmpeg</code>
                        <p className="mt-2 text-xs">Or with pip:</p>
                        <code className="block bg-black/50 p-2 my-1">pip3 install yt-dlp</code>
                    </div>
                );
            case 'win32':
                return (
                    <div className="text-sm text-white/60 mt-4 p-4 border border-white/10 bg-black/30">
                        <p className="font-semibold mb-2">Manual Installation (Windows):</p>
                        <code className="block bg-black/50 p-2 my-1">winget install yt-dlp ffmpeg</code>
                    </div>
                );
            default:
                return (
                    <div className="text-sm text-white/60 mt-4 p-4 border border-white/10 bg-black/30">
                        <p className="font-semibold mb-2">Manual Installation (Linux):</p>
                        <code className="block bg-black/50 p-2 my-1">pip3 install yt-dlp</code>
                        <code className="block bg-black/50 p-2 my-1">sudo apt install ffmpeg</code>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-[#00FF41] text-3xl font-mono mb-2">~~~</div>
                    <h1 className="text-3xl font-bold mb-2">Streamline</h1>
                    <p className="text-white/60">YouTube Downloader</p>
                </div>

                {/* Setup Card */}
                <div className="border border-white/20 bg-[#0a0a0a] p-6">
                    <h2 className="text-xl font-semibold mb-4">Setup Required</h2>
                    <p className="text-white/70 mb-6">
                        Streamline needs a couple of tools installed to download videos.
                        {validation.canAutoInstall
                            ? " Click the buttons below to install them automatically."
                            : " Please install them manually using the instructions below."}
                    </p>

                    {/* Dependencies */}
                    <div className="space-y-4">
                        {/* yt-dlp */}
                        <div className="flex items-center justify-between p-4 border border-white/10 bg-black/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${ytdlpReady ? 'bg-[#00FF41]' : installing === 'yt-dlp' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                                <div>
                                    <div className="font-medium">yt-dlp</div>
                                    <div className="text-xs text-white/50">
                                        {ytdlpReady
                                            ? validation.ytdlp.version || 'Installed'
                                            : installing === 'yt-dlp' ? 'Installing...' : 'Required for downloading'}
                                    </div>
                                </div>
                            </div>
                            {!ytdlpReady && validation.canAutoInstall && (
                                <button
                                    onClick={() => installDependency('yt-dlp')}
                                    disabled={installing !== null}
                                    className="px-4 py-2 bg-[#00FF41] text-[#050505] font-semibold text-sm hover:bg-[#00cc33] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {installing === 'yt-dlp' ? 'Installing...' : 'Install'}
                                </button>
                            )}
                            {ytdlpReady && (
                                <span className="text-[#00FF41] text-sm">✓ Ready</span>
                            )}
                        </div>

                        {/* ffmpeg */}
                        <div className="flex items-center justify-between p-4 border border-white/10 bg-black/30">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${ffmpegReady ? 'bg-[#00FF41]' : installing === 'ffmpeg' ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-500'}`} />
                                <div>
                                    <div className="font-medium">ffmpeg</div>
                                    <div className="text-xs text-white/50">
                                        {ffmpegReady
                                            ? 'Installed'
                                            : installing === 'ffmpeg' ? 'Installing...' : 'Optional - for audio conversion'}
                                    </div>
                                </div>
                            </div>
                            {!ffmpegReady && validation.canAutoInstall && (
                                <button
                                    onClick={() => installDependency('ffmpeg')}
                                    disabled={installing !== null}
                                    className="px-4 py-2 border border-white/20 text-sm hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {installing === 'ffmpeg' ? 'Installing...' : 'Install'}
                                </button>
                            )}
                            {ffmpegReady && (
                                <span className="text-[#00FF41] text-sm">✓ Ready</span>
                            )}
                        </div>
                    </div>

                    {/* Install Progress Log */}
                    {installLogs.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-white/60">Installation Progress</h3>
                                {!installing && (
                                    <button
                                        onClick={() => setInstallLogs([])}
                                        className="text-xs text-white/40 hover:text-white/60"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div
                                ref={logContainerRef}
                                className="bg-black/50 border border-white/10 p-3 font-mono text-xs max-h-40 overflow-y-auto"
                            >
                                {installLogs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`mb-1 ${log.type === 'error' ? 'text-red-400' :
                                            log.type === 'complete' ? 'text-[#00FF41]' :
                                                log.type === 'info' ? 'text-blue-400' :
                                                    'text-white/80'
                                            }`}
                                    >
                                        {log.data}
                                    </div>
                                ))}
                                {installing && (
                                    <div className="text-yellow-400 animate-pulse">⏳ Please wait...</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !installing && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Manual Instructions */}
                    {!validation.canAutoInstall && getManualInstructions()}

                    {/* Continue Button */}
                    {allReady ? (
                        <button
                            onClick={onComplete}
                            className="w-full mt-6 py-3 bg-[#00FF41] text-[#050505] font-semibold hover:bg-[#00cc33] transition-colors"
                        >
                            Continue to App →
                        </button>
                    ) : (
                        <div className="mt-6 text-center text-white/40 text-sm">
                            {installing
                                ? '⏳ Installation in progress...'
                                : validation.canAutoInstall
                                    ? 'Install yt-dlp to continue'
                                    : 'Install the required dependencies to continue'}
                        </div>
                    )}

                    {/* Skip Button */}
                    {ytdlpReady && !ffmpegReady && !installing && (
                        <button
                            onClick={onComplete}
                            className="w-full mt-2 py-2 text-white/40 hover:text-white/60 text-sm transition-colors"
                        >
                            Skip ffmpeg (some features may not work)
                        </button>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/30 text-xs mt-6">
                    Using package manager: {validation.packageManager || 'none detected'}
                </p>
            </div>
        </div>
    );
}
