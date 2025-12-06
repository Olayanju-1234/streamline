import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

// Configuration
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'https://streamline-client.onrender.com'];
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || process.cwd();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'], credentials: true },
});

// Middleware
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check dependency
async function checkDependency(command: string): Promise<{ installed: boolean; version?: string }> {
  try {
    const { stdout } = await execAsync(`${command} --version`);
    return { installed: true, version: stdout.trim().split('\n')[0] };
  } catch {
    return { installed: false };
  }
}

// Check for package managers
async function getAvailablePackageManager(): Promise<'brew' | 'pip3' | 'pip' | 'winget' | null> {
  const platform = os.platform();
  if (platform === 'darwin') {
    try { await execAsync('brew --version'); return 'brew'; } catch { /* continue */ }
  }
  if (platform === 'win32') {
    try { await execAsync('winget --version'); return 'winget'; } catch { /* continue */ }
  }
  try { await execAsync('pip3 --version'); return 'pip3'; } catch {
    try { await execAsync('pip --version'); return 'pip'; } catch { return null; }
  }
}

// Validate dependencies
app.get('/api/validate', async (_req, res) => {
  const [ytdlp, ffmpeg] = await Promise.all([checkDependency('yt-dlp'), checkDependency('ffmpeg')]);
  const packageManager = await getAvailablePackageManager();
  res.json({
    ytdlp, ffmpeg,
    installed: ytdlp.installed,
    version: ytdlp.version,
    canAutoInstall: packageManager !== null,
    packageManager,
    platform: os.platform(),
  });
});

// Get common folder paths for download location picker
app.get('/api/folders', (_req, res) => {
  const homeDir = os.homedir();
  const folders = [
    { id: 'downloads', name: '📥 Downloads', path: `${homeDir}/Downloads` },
    { id: 'desktop', name: '🖥️ Desktop', path: `${homeDir}/Desktop` },
    { id: 'documents', name: '📄 Documents', path: `${homeDir}/Documents` },
    { id: 'videos', name: '🎬 Videos', path: `${homeDir}/Videos` },
    { id: 'music', name: '🎵 Music', path: `${homeDir}/Music` },
    { id: 'home', name: '🏠 Home', path: homeDir },
    { id: 'server', name: '⚙️ Server Default', path: DOWNLOAD_PATH },
  ];
  res.json({ folders, homeDir });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let activeDownload: ReturnType<typeof spawn> | null = null;
  let activeInstall: ReturnType<typeof spawn> | null = null;

  // Handle install request
  socket.on('install-dependency', async (data: { dependency: string }) => {
    const { dependency } = data;
    if (!dependency || !['yt-dlp', 'ffmpeg'].includes(dependency)) {
      socket.emit('install-log', { type: 'error', data: 'Invalid dependency' });
      return;
    }
    const packageManager = await getAvailablePackageManager();
    if (!packageManager) {
      socket.emit('install-log', { type: 'error', data: 'No package manager found.' });
      return;
    }
    let command: string, args: string[];
    switch (packageManager) {
      case 'brew': command = 'brew'; args = ['install', dependency]; break;
      case 'pip3': command = 'pip3'; args = dependency === 'yt-dlp' ? ['install', '--user', 'yt-dlp'] : ['install', '--user', 'ffmpeg-python']; break;
      case 'pip': command = 'pip'; args = dependency === 'yt-dlp' ? ['install', '--user', 'yt-dlp'] : ['install', '--user', 'ffmpeg-python']; break;
      case 'winget': command = 'winget'; args = ['install', dependency]; break;
      default: socket.emit('install-log', { type: 'error', data: 'No package manager' }); return;
    }
    console.log(`Installing ${dependency}`);
    socket.emit('install-log', { type: 'info', data: `Installing ${dependency}...` });
    if (activeInstall) { activeInstall.kill(); activeInstall = null; }
    try {
      const proc = spawn(command, args, { env: { ...process.env, HOMEBREW_NO_AUTO_UPDATE: '1' } });
      activeInstall = proc;
      proc.stdout.on('data', (chunk) => {
        chunk.toString().split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
          let clean = line.trim();
          if (clean.includes('Downloading')) clean = '📥 ' + clean;
          else if (clean.includes('Installing') || clean.includes('Pouring')) clean = '📦 ' + clean;
          else if (clean.includes('✓') || clean.includes('installed')) clean = '✅ ' + clean;
          socket.emit('install-log', { type: 'stdout', data: clean });
        });
      });
      proc.stderr.on('data', (chunk) => {
        chunk.toString().split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
          socket.emit('install-log', { type: 'stderr', data: line.trim() });
        });
      });
      proc.on('close', async (code) => {
        activeInstall = null;
        const check = await checkDependency(dependency);
        if (check.installed) socket.emit('install-log', { type: 'complete', data: `✅ ${dependency} installed!`, version: check.version });
        else if (code === 0) socket.emit('install-log', { type: 'complete', data: '✅ Done. Restart server if needed.' });
        else socket.emit('install-log', { type: 'error', data: `Failed. Try: ${command} ${args.join(' ')}` });
      });
      proc.on('error', (e) => { activeInstall = null; socket.emit('install-log', { type: 'error', data: e.message }); });
    } catch (e) { socket.emit('install-log', { type: 'error', data: String(e) }); }
  });

  // Handle download request
  socket.on('start-download', async (data: { url: string; flags: string[]; downloadPath?: string }) => {
    const { url, flags, downloadPath } = data;
    if (!url) { socket.emit('download-log', { type: 'error', data: 'Invalid URL\n' }); return; }
    if (activeDownload) { activeDownload.kill(); activeDownload = null; }
    const targetPath = downloadPath || DOWNLOAD_PATH;
    console.log(`Downloading to: ${targetPath}`);
    try {
      const proc = spawn('yt-dlp', [...flags, url], { cwd: targetPath });
      activeDownload = proc;
      proc.stdout.on('data', (d) => socket.emit('download-log', { type: 'stdout', data: d.toString() }));
      proc.stderr.on('data', (d) => socket.emit('download-log', { type: 'stderr', data: d.toString() }));
      proc.on('close', (code) => { activeDownload = null; socket.emit('download-log', { type: 'complete', data: `Exit code ${code}\n... waiting` }); });
      proc.on('error', (e) => { activeDownload = null; socket.emit('download-log', { type: 'error', data: e.message }); });
    } catch (e) { socket.emit('download-log', { type: 'error', data: String(e) }); }
  });

  // Handle cancel
  socket.on('cancel-download', () => {
    if (activeDownload) { activeDownload.kill(); activeDownload = null; socket.emit('download-log', { type: 'complete', data: 'Cancelled' }); }
  });

  // Cleanup
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (activeDownload) { activeDownload.kill(); activeDownload = null; }
    if (activeInstall) { activeInstall.kill(); activeInstall = null; }
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origins: ${CORS_ORIGINS.join(', ')}`);
});
