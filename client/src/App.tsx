import { useEffect, useState } from 'react';
import { useCommandStore } from './store/useCommandStore';
import { config } from './config';
import CuratorMode from './components/CuratorMode';
import TerminalMode from './components/TerminalMode';
import SetupWizard from './components/SetupWizard';

interface ValidationResult {
  ytdlp: { installed: boolean; version?: string };
  ffmpeg: { installed: boolean; version?: string };
  canAutoInstall: boolean;
  packageManager: string | null;
  platform: string;
  // Legacy
  installed?: boolean;
}

function App() {
  const mode = useCommandStore((state) => state.mode);
  const setError = useCommandStore((state) => state.setError);

  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    // Validate dependencies on mount
    fetch(`${config.apiUrl}/validate`)
      .then((res) => res.json())
      .then((data: ValidationResult) => {
        setValidation(data);

        // If yt-dlp is installed, skip setup wizard
        if (data.ytdlp?.installed || data.installed) {
          setSetupComplete(true);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to validate dependencies:', err);
        setError('Cannot connect to server. Please ensure the server is running.');
        setIsLoading(false);
        // Show the app anyway, error will be displayed
        setSetupComplete(true);
      });
  }, [setError]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#00FF41] text-3xl font-mono mb-4 animate-pulse">~~~</div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Setup wizard (if dependencies missing)
  if (!setupComplete && validation && !validation.ytdlp?.installed) {
    return (
      <SetupWizard
        validation={validation}
        onComplete={() => setSetupComplete(true)}
      />
    );
  }

  // Main app
  return (
    <div
      className={`min-h-screen transition-all duration-500 ${mode === 'curator'
        ? 'bg-[#FAFAFA] text-[#111]'
        : 'bg-[#050505] text-white'
        }`}
    >
      {mode === 'curator' ? <CuratorMode /> : <TerminalMode />}
    </div>
  );
}

export default App;
