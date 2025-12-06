// Command flag definitions for yt-dlp
export interface CommandFlag {
    id: string;
    flag: string;
    label: string;
    description: string;
    category: 'format' | 'quality' | 'subtitles' | 'post-processing' | 'filesystem' | 'network' | 'authentication';
    hasValue?: boolean;
    valueType?: 'text' | 'select';
    options?: { value: string; label: string }[];
    defaultValue?: string;
}

export const AVAILABLE_FLAGS: CommandFlag[] = [
    // ==================== FORMAT ====================
    {
        id: 'best-video',
        flag: '-f',
        label: 'Best Video+Audio',
        description: 'Download best video with audio merged',
        category: 'format'
    },
    {
        id: 'extract-audio',
        flag: '-x',
        label: 'Extract Audio',
        description: 'Extract audio only (requires ffmpeg)',
        category: 'format'
    },
    {
        id: 'force-mp4',
        flag: '--recode-video mp4',
        label: 'Convert to MP4',
        description: 'Re-encode video to MP4 format',
        category: 'format'
    },
    {
        id: 'force-webm',
        flag: '--recode-video webm',
        label: 'Convert to WebM',
        description: 'Re-encode video to WebM format',
        category: 'format'
    },
    {
        id: 'keep-video',
        flag: '-k',
        label: 'Keep Original',
        description: 'Keep the intermediate video file after post-processing',
        category: 'format'
    },

    // ==================== QUALITY ====================
    {
        id: 'quality-best',
        flag: '-f best',
        label: 'Best Quality',
        description: 'Download the best available quality',
        category: 'quality'
    },
    {
        id: 'quality-worst',
        flag: '-f worst',
        label: 'Lowest Quality',
        description: 'Download the lowest quality (saves bandwidth)',
        category: 'quality'
    },
    {
        id: 'quality-1080',
        flag: '-f bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        label: 'Max 1080p',
        description: 'Best quality up to 1080p resolution',
        category: 'quality'
    },
    {
        id: 'quality-720',
        flag: '-f bestvideo[height<=720]+bestaudio/best[height<=720]',
        label: 'Max 720p',
        description: 'Best quality up to 720p resolution',
        category: 'quality'
    },
    {
        id: 'quality-480',
        flag: '-f bestvideo[height<=480]+bestaudio/best[height<=480]',
        label: 'Max 480p',
        description: 'Best quality up to 480p resolution',
        category: 'quality'
    },
    {
        id: 'prefer-free',
        flag: '--prefer-free-formats',
        label: 'Prefer Free Formats',
        description: 'Prefer free video formats (webm over mp4)',
        category: 'quality'
    },

    // ==================== SUBTITLES ====================
    {
        id: 'write-subs',
        flag: '--write-subs',
        label: 'Download Subs',
        description: 'Download subtitles as separate file',
        category: 'subtitles'
    },
    {
        id: 'write-auto-subs',
        flag: '--write-auto-subs',
        label: 'Auto-Generated Subs',
        description: 'Download auto-generated subtitles',
        category: 'subtitles'
    },
    {
        id: 'embed-subs',
        flag: '--embed-subs',
        label: 'Embed Subtitles',
        description: 'Embed subtitles into the video file',
        category: 'subtitles'
    },
    {
        id: 'all-subs',
        flag: '--all-subs',
        label: 'All Languages',
        description: 'Download all available subtitle languages',
        category: 'subtitles'
    },
    {
        id: 'sub-format-srt',
        flag: '--sub-format srt',
        label: 'SRT Format',
        description: 'Prefer SRT subtitle format',
        category: 'subtitles'
    },

    // ==================== POST-PROCESSING ====================
    {
        id: 'merge-mp4',
        flag: '--merge-output-format mp4',
        label: 'Merge to MP4',
        description: 'Merge video and audio into MP4 container',
        category: 'post-processing'
    },
    {
        id: 'merge-mkv',
        flag: '--merge-output-format mkv',
        label: 'Merge to MKV',
        description: 'Merge video and audio into MKV container',
        category: 'post-processing'
    },
    {
        id: 'embed-thumbnail',
        flag: '--embed-thumbnail',
        label: 'Embed Thumbnail',
        description: 'Embed thumbnail as video cover art',
        category: 'post-processing'
    },
    {
        id: 'embed-metadata',
        flag: '--embed-metadata',
        label: 'Embed Metadata',
        description: 'Embed metadata (title, uploader) into file',
        category: 'post-processing'
    },
    {
        id: 'embed-chapters',
        flag: '--embed-chapters',
        label: 'Embed Chapters',
        description: 'Embed video chapters into the file',
        category: 'post-processing'
    },
    {
        id: 'write-metadata',
        flag: '--write-info-json',
        label: 'Save Metadata JSON',
        description: 'Save video metadata as JSON file',
        category: 'post-processing'
    },
    {
        id: 'write-thumbnail',
        flag: '--write-thumbnail',
        label: 'Save Thumbnail',
        description: 'Download and save thumbnail image',
        category: 'post-processing'
    },
    {
        id: 'audio-mp3',
        flag: '--audio-format mp3',
        label: 'Audio: MP3',
        description: 'Convert extracted audio to MP3',
        category: 'post-processing'
    },
    {
        id: 'audio-m4a',
        flag: '--audio-format m4a',
        label: 'Audio: M4A',
        description: 'Convert extracted audio to M4A (AAC)',
        category: 'post-processing'
    },
    {
        id: 'audio-wav',
        flag: '--audio-format wav',
        label: 'Audio: WAV',
        description: 'Convert extracted audio to WAV (lossless)',
        category: 'post-processing'
    },
    {
        id: 'audio-best',
        flag: '--audio-quality 0',
        label: 'Best Audio Quality',
        description: 'Use highest quality for audio conversion',
        category: 'post-processing'
    },
    {
        id: 'split-chapters',
        flag: '--split-chapters',
        label: 'Split by Chapters',
        description: 'Split video into separate files by chapter',
        category: 'post-processing'
    },

    // ==================== FILESYSTEM ====================
    {
        id: 'no-overwrites',
        flag: '--no-overwrites',
        label: 'No Overwrites',
        description: 'Do not overwrite existing files',
        category: 'filesystem'
    },
    {
        id: 'continue',
        flag: '-c',
        label: 'Resume Downloads',
        description: 'Resume partially downloaded files',
        category: 'filesystem'
    },
    {
        id: 'no-playlist',
        flag: '--no-playlist',
        label: 'Single Video Only',
        description: 'Download only the video, not the entire playlist',
        category: 'filesystem'
    },
    {
        id: 'yes-playlist',
        flag: '--yes-playlist',
        label: 'Download Playlist',
        description: 'Download the entire playlist',
        category: 'filesystem'
    },
    {
        id: 'ignore-errors',
        flag: '--ignore-errors',
        label: 'Ignore Errors',
        description: 'Continue on download errors',
        category: 'filesystem'
    },
    {
        id: 'restrict-filenames',
        flag: '--restrict-filenames',
        label: 'Safe Filenames',
        description: 'Use only ASCII characters in filenames',
        category: 'filesystem'
    },
    {
        id: 'windows-filenames',
        flag: '--windows-filenames',
        label: 'Windows-Safe Names',
        description: 'Make filenames Windows-compatible',
        category: 'filesystem'
    },
    {
        id: 'write-description',
        flag: '--write-description',
        label: 'Save Description',
        description: 'Save video description to a text file',
        category: 'filesystem'
    },
    {
        id: 'write-comments',
        flag: '--write-comments',
        label: 'Save Comments',
        description: 'Save video comments to a JSON file',
        category: 'filesystem'
    },

    // ==================== NETWORK ====================
    {
        id: 'limit-rate',
        flag: '-r 1M',
        label: 'Limit: 1 MB/s',
        description: 'Limit download speed to 1 MB/s',
        category: 'network'
    },
    {
        id: 'limit-rate-500k',
        flag: '-r 500K',
        label: 'Limit: 500 KB/s',
        description: 'Limit download speed to 500 KB/s',
        category: 'network'
    },
    {
        id: 'retries',
        flag: '--retries 10',
        label: '10 Retries',
        description: 'Retry failed downloads up to 10 times',
        category: 'network'
    },
    {
        id: 'sleep',
        flag: '--sleep-interval 3',
        label: 'Sleep 3s',
        description: 'Sleep 3 seconds between downloads (avoid rate limiting)',
        category: 'network'
    },
    {
        id: 'no-check-certificate',
        flag: '--no-check-certificate',
        label: 'Skip SSL Check',
        description: 'Skip HTTPS certificate verification',
        category: 'network'
    },
    {
        id: 'force-ipv4',
        flag: '--force-ipv4',
        label: 'Force IPv4',
        description: 'Use IPv4 only for connections',
        category: 'network'
    },
    {
        id: 'geo-bypass',
        flag: '--geo-bypass',
        label: 'Geo Bypass',
        description: 'Bypass geographic restrictions',
        category: 'network'
    },

    // ==================== AUTHENTICATION ====================
    {
        id: 'cookies-from-browser',
        flag: '--cookies-from-browser chrome',
        label: 'Use Chrome Cookies',
        description: 'Use cookies from Chrome browser for authentication',
        category: 'authentication'
    },
    {
        id: 'cookies-firefox',
        flag: '--cookies-from-browser firefox',
        label: 'Use Firefox Cookies',
        description: 'Use cookies from Firefox browser for authentication',
        category: 'authentication'
    },
    {
        id: 'cookies-safari',
        flag: '--cookies-from-browser safari',
        label: 'Use Safari Cookies',
        description: 'Use cookies from Safari browser for authentication',
        category: 'authentication'
    },
    {
        id: 'age-limit',
        flag: '--age-limit 18',
        label: 'Age 18+ Content',
        description: 'Allow age-restricted content (requires cookies)',
        category: 'authentication'
    },
];

// Output template variables
export const TEMPLATE_VARIABLES = [
    { variable: '%(title)s', description: 'Video title' },
    { variable: '%(uploader)s', description: 'Uploader name' },
    { variable: '%(upload_date)s', description: 'Upload date (YYYYMMDD)' },
    { variable: '%(ext)s', description: 'File extension' },
    { variable: '%(id)s', description: 'Video ID' },
    { variable: '%(channel)s', description: 'Channel name' },
    { variable: '%(playlist)s', description: 'Playlist name' },
    { variable: '%(playlist_index)s', description: 'Playlist index' },
    { variable: '%(resolution)s', description: 'Video resolution' },
    { variable: '%(duration)s', description: 'Video duration in seconds' },
    { variable: '%(view_count)s', description: 'View count' },
    { variable: '%(like_count)s', description: 'Like count' },
] as const;

// Common output template presets
export const TEMPLATE_PRESETS = [
    {
        name: 'Default',
        template: '%(title)s.%(ext)s',
        description: 'Simple title and extension'
    },
    {
        name: 'With Uploader',
        template: '%(uploader)s - %(title)s.%(ext)s',
        description: 'Uploader name followed by title'
    },
    {
        name: 'Organized',
        template: '%(uploader)s/%(title)s.%(ext)s',
        description: 'Create folder for each uploader'
    },
    {
        name: 'With Date',
        template: '%(upload_date)s - %(title)s.%(ext)s',
        description: 'Date prefix for chronological sorting'
    },
    {
        name: 'Playlist',
        template: '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s',
        description: 'Organized by playlist with index'
    },
    {
        name: 'Full Info',
        template: '[%(id)s] %(title)s (%(resolution)s).%(ext)s',
        description: 'ID, title, and resolution'
    },
];

// Default output template
export const DEFAULT_OUTPUT_TEMPLATE = '%(title)s.%(ext)s';

// Default Terminal Mode flags
export const DEFAULT_TERMINAL_FLAGS = new Set<string>([
    '-f',
    '--embed-subs',
    '--embed-thumbnail',
    '--no-playlist',
]);

// Category display order and labels
export const FLAG_CATEGORIES = [
    { id: 'format', label: 'FORMAT', description: 'Output format options' },
    { id: 'quality', label: 'QUALITY', description: 'Video quality selection' },
    { id: 'subtitles', label: 'SUBTITLES', description: 'Subtitle options' },
    { id: 'post-processing', label: 'POST-PROCESSING', description: 'Post-download processing' },
    { id: 'filesystem', label: 'FILESYSTEM', description: 'File and playlist options' },
    { id: 'network', label: 'NETWORK', description: 'Network and rate limiting' },
    { id: 'authentication', label: 'AUTH', description: 'Authentication and cookies' },
] as const;
