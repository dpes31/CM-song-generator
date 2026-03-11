/**
 * 12 Brand Archetypes Matrix
 * Used as context for LLM execution or default fallback mapping.
 */

export const BRAND_ARCHETYPES = {
    Hero: {
        name: "승부사 (The Hero)",
        genreBPM: "Hard Rock, Epic Orchestral, 140-160 BPM",
        texture: "distorted electric guitar, pulsating bass, metallic synths",
        vocal: "Powerful belted male/female vocal, triumphant",
        toneKeywords: ["승리", "성취", "파워풀", "극복"],
        avoidKeywords: ["나약한", "망설이는", "포기"]
    },
    Everyman: {
        name: "평범한 사람 (The Everyman)",
        genreBPM: "Indie Pop, Funk, 110-130 BPM",
        texture: "clean electric guitar, warm bass, bright synth plucks",
        vocal: "Friendly smiling pop vocal, upbeat",
        toneKeywords: ["소속감", "친근한", "공감", "매일매일"],
        avoidKeywords: ["과시하는", "고압적인", "혼자만의"]
    },
    Sage: {
        name: "현자 (The Sage)",
        genreBPM: "Minimalist Classical, Jazz, 85-95 BPM",
        texture: "grand piano, sophisticated strings, warm Rhodes",
        vocal: "Close-mic breathy vocal, authoritative baritone",
        toneKeywords: ["지혜로운", "진실", "명확한", "전문가"],
        avoidKeywords: ["가벼운", "장난스러운", "유행타는"]
    }
    // TODO: Add the remaining 9 archetypes as detailed in docx
};

export function determineArchetype(brandDescription: string): keyof typeof BRAND_ARCHETYPES | null {
    // In actual implementation, an async LLM call will happen here
    // For now we mock it
    if (brandDescription.toLowerCase().includes('에너지')) return 'Hero';
    if (brandDescription.toLowerCase().includes('금융')) return 'Sage';
    return 'Everyman'; // Default
}
