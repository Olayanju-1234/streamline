import { useEffect, useCallback } from 'react';
import { useCommandStore } from '../store/useCommandStore';
import { getSocket, onDownloadLog, emitStartDownload } from '../services/socket';
import type { DownloadLogEvent } from '../types/socket';

export function useDownload() {
  const { addLog, setIsDownloading, setError, downloadPath } = useCommandStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to server. Please ensure the server is running.');
    });

    const unsubscribe = onDownloadLog((event: DownloadLogEvent) => {
      const lines = event.data.split('\n').filter((line) => line.trim());
      lines.forEach((line) => {
        addLog(line);
      });

      if (event.type === 'complete') {
        setIsDownloading(false);
      } else if (event.type === 'error') {
        setIsDownloading(false);
        const errorLine = lines[lines.length - 1];
        if (errorLine) {
          setError(errorLine);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addLog, setIsDownloading, setError]);

  const startDownload = useCallback(async (url: string, flags: string[]) => {
    const socket = getSocket();

    if (!socket.connected) {
      setError('Not connected to server. Please wait and try again.');
      return;
    }

    setIsDownloading(true);
    setError(null);

    // Send downloadPath along with the request
    emitStartDownload({
      url,
      flags,
      downloadPath: downloadPath || undefined
    });
  }, [setIsDownloading, setError, downloadPath]);

  const cancelDownload = useCallback(() => {
    const socket = getSocket();

    if (socket.connected) {
      socket.emit('cancel-download');
      addLog('Cancelling download...');
    }
  }, [addLog]);

  return {
    startDownload,
    cancelDownload,
    isDownloading: useCommandStore((state) => state.isDownloading),
  };
}
