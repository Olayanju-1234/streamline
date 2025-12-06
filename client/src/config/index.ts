// Environment-based configuration
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
} as const;

export type Config = typeof config;
