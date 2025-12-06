import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_OUTPUT_TEMPLATE, DEFAULT_TERMINAL_FLAGS } from '../constants';
import type { Mode, DownloadFormat } from '../types';

// Mutually exclusive flag groups
const EXCLUSIVE_GROUPS = {
  format: ['-f', '-x'],
  quality: [
    '-f best',
    '-f worst',
    '-f bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '-f bestvideo[height<=720]+bestaudio/best[height<=720]',
    '-f bestvideo[height<=480]+bestaudio/best[height<=480]',
  ],
  merge: ['--merge-output-format mp4', '--merge-output-format mkv'],
  audioFormat: ['--audio-format mp3', '--audio-format m4a', '--audio-format wav'],
  recode: ['--recode-video mp4', '--recode-video webm'],
  playlist: ['--no-playlist', '--yes-playlist'],
  cookies: ['--cookies-from-browser chrome', '--cookies-from-browser firefox', '--cookies-from-browser safari'],
  rateLimit: ['-r 1M', '-r 500K'],
};

export interface CommandState {
  // UI State
  mode: Mode;
  url: string;
  format: DownloadFormat;
  flags: Set<string>;
  outputTemplate: string;
  downloadPath: string;  // User-specified download path

  // Download State
  logs: string[];
  isDownloading: boolean;
  error: string | null;

  // Connection State
  ytdlpInstalled: boolean | null;

  // Actions
  setMode: (mode: Mode) => void;
  setUrl: (url: string) => void;
  setFormat: (format: DownloadFormat) => void;
  toggleFlag: (flag: string) => void;
  setOutputTemplate: (template: string) => void;
  setDownloadPath: (path: string) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
  setIsDownloading: (isDownloading: boolean) => void;
  setError: (error: string | null) => void;
  setYtdlpInstalled: (installed: boolean) => void;
  getCommandFlags: () => string[];
  reset: () => void;
}

const initialState = {
  mode: 'curator' as Mode,
  url: '',
  format: 'video' as DownloadFormat,
  flags: new Set<string>(),
  outputTemplate: DEFAULT_OUTPUT_TEMPLATE,
  downloadPath: '',  // Empty means use server default
  logs: [],
  isDownloading: false,
  error: null,
  ytdlpInstalled: null,
};

// Find which exclusive group a flag belongs to
function findExclusiveGroup(flag: string): string[] | null {
  for (const group of Object.values(EXCLUSIVE_GROUPS)) {
    if (group.includes(flag)) {
      return group;
    }
  }
  return null;
}

export const useCommandStore = create<CommandState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMode: (mode) => {
        set({ mode, error: null });
        if (mode === 'curator') {
          set({ flags: new Set<string>() });
        } else {
          set({ flags: new Set(DEFAULT_TERMINAL_FLAGS) });
        }
      },

      setUrl: (url) => set({ url, error: null }),

      setFormat: (format) => {
        set({ format });
        const state = get();
        const newFlags = new Set(state.flags);
        if (format === 'audio') {
          newFlags.delete('-f');
          newFlags.add('-x');
        } else {
          newFlags.delete('-x');
          newFlags.add('-f');
        }
        set({ flags: newFlags });
      },

      toggleFlag: (flag) => {
        const state = get();
        const newFlags = new Set(state.flags);

        const exclusiveGroup = findExclusiveGroup(flag);

        if (exclusiveGroup) {
          for (const groupFlag of exclusiveGroup) {
            newFlags.delete(groupFlag);
          }
          if (!state.flags.has(flag)) {
            newFlags.add(flag);
          }
        } else {
          if (newFlags.has(flag)) {
            newFlags.delete(flag);
          } else {
            newFlags.add(flag);
          }
        }

        set({ flags: newFlags });
      },

      setOutputTemplate: (template) => set({ outputTemplate: template }),

      setDownloadPath: (path) => set({ downloadPath: path }),

      addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

      clearLogs: () => set({ logs: [], error: null }),

      setIsDownloading: (isDownloading) => set({ isDownloading }),

      setError: (error) => set({ error }),

      setYtdlpInstalled: (installed) => set({ ytdlpInstalled: installed }),

      getCommandFlags: () => {
        const state = get();
        const flags: string[] = [];

        if (state.mode === 'terminal') {
          const sortedFlags = Array.from(state.flags).sort();

          sortedFlags.forEach((flag) => {
            if (flag.includes(' ')) {
              const parts = flag.split(' ');
              flags.push(...parts);
            } else {
              flags.push(flag);
            }
          });

          // Add output template if modified
          if (state.outputTemplate && state.outputTemplate !== DEFAULT_OUTPUT_TEMPLATE) {
            flags.push('-o', state.outputTemplate);
          }
        } else {
          // Curator Mode
          if (state.format === 'video') {
            flags.push('-f', 'bestvideo+bestaudio/best');
          } else {
            flags.push('-x', '--audio-format', 'mp3');
          }
        }

        return flags;
      },

      reset: () => set(initialState),
    }),
    {
      name: 'streamline-settings',
      partialize: (state) => ({
        downloadPath: state.downloadPath,
        outputTemplate: state.outputTemplate,
      }),
    }
  )
);
