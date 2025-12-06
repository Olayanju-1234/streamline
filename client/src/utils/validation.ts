// YouTube URL validation patterns
const YOUTUBE_PATTERNS = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/v\/[\w-]+/,
    /^(https?:\/\/)?youtu\.be\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/@[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/channel\/[\w-]+/,
];

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    const trimmed = url.trim();
    return YOUTUBE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Extracts the video ID from a YouTube URL
 */
export function extractVideoId(url: string): string | null {
    if (!url) return null;

    const trimmed = url.trim();

    // Watch URL pattern: youtube.com/watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/[?&]v=([\w-]+)/);
    if (watchMatch) return watchMatch[1];

    // Shortened URL pattern: youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) return shortMatch[1];

    // Shorts URL pattern: youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmed.match(/shorts\/([\w-]+)/);
    if (shortsMatch) return shortsMatch[1];

    // Embed URL pattern: youtube.com/embed/VIDEO_ID
    const embedMatch = trimmed.match(/embed\/([\w-]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
}

/**
 * Gets a validation error message for a URL
 */
export function getUrlValidationError(url: string): string | null {
    if (!url.trim()) {
        return null; // Empty is not an error, just not ready
    }

    if (!isValidYouTubeUrl(url)) {
        return 'Please enter a valid YouTube URL';
    }

    return null;
}
