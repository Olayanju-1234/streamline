import { io, Socket } from 'socket.io-client';
import { config } from '../config';
import type { DownloadLogEvent, StartDownloadData } from '../types/socket';

// Socket singleton
let socket: Socket | null = null;

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Get or create the socket connection
 */
export function getSocket(): Socket {
    if (!socket) {
        socket = io(config.socketUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }
    return socket;
}

/**
 * Disconnect and cleanup socket
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Subscribe to download logs
 */
export function onDownloadLog(callback: (event: DownloadLogEvent) => void): () => void {
    const s = getSocket();
    s.on('download-log', callback);
    return () => s.off('download-log', callback);
}

/**
 * Subscribe to connection status changes
 */
export function onConnectionStatus(callback: (status: ConnectionStatus) => void): () => void {
    const s = getSocket();

    const onConnect = () => callback('connected');
    const onDisconnect = () => callback('disconnected');
    const onError = () => callback('error');
    const onConnecting = () => callback('connecting');

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);
    s.io.on('reconnect_attempt', onConnecting);

    return () => {
        s.off('connect', onConnect);
        s.off('disconnect', onDisconnect);
        s.off('connect_error', onError);
        s.io.off('reconnect_attempt', onConnecting);
    };
}

/**
 * Start a download
 */
export function emitStartDownload(data: StartDownloadData): void {
    const s = getSocket();
    s.emit('start-download', data);
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
    return socket?.connected ?? false;
}
