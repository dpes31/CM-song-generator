/**
 * Suno Prompt Builder Module
 * 
 * Handles string truncations, negative prompt injections, and lyric sanitization 
 * to act as a safeguard before sending requests to Suno API.
 */

// Hardcoded default negative tags as per guideline
export const DEFAULT_NEGATIVE_TAGS = "no synth pads, no ambient wash, no lo-fi, no vocal distortion";

/**
 * Truncates string to a maximum of 120 characters without breaking words.
 */
export function truncateStyleTags(tags: string): string {
    if (tags.length <= 120) return tags;
    const truncated = tags.substring(0, 120);
    // Cut off at the last comma or space to avoid broken words
    const lastCommaIndex = truncated.lastIndexOf(',');
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    const cutIndex = Math.max(lastCommaIndex, lastSpaceIndex);

    return cutIndex > 0 ? truncated.substring(0, cutIndex) : truncated;
}

/**
 * Validates and cleans the lyrics string 
 * Removes ellipsis, periods, hyphens but keeps bracket tags and commas for pacing.
 */
export function sanitizeLyrics(lyrics: string): string {
    let cleaned = lyrics;
    // 1. Remove ellipsis, periods, hyphens
    cleaned = cleaned.replace(/\.\.\./g, '');
    cleaned = cleaned.replace(/\./g, '');
    cleaned = cleaned.replace(/-/g, ' ');

    // 2. Add validation for Meta-tags 
    // Usually, brackets are kept intact as Suno relies on [Chorus], [Verse], etc.
    // Further custom regex can be added here if needed to strictly block bad patterns

    return cleaned.trim();
}
