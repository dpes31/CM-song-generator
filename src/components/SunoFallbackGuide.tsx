import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, ChevronRight, X } from 'lucide-react';

/**
 * [V6.0] Suno Fallback Guide — 수동 모드 결과 모달
 *
 * 개선사항:
 * - Framer Motion → CSS transition 교체 (Phase 1)
 * - 마스터 프롬프트 전체 복사 버튼
 * - 섹션별 개별 복사 버튼 (Lyrics, Style of Music, Exclude Styles)
 */

interface FallbackGuideProps {
    isOpen: boolean;
    onClose: () => void;
    brandData?: {
        archetype: string;
        keywords: string[];
        promptTemplate: string;
        tags: string;
    };
}

/**
 * 프롬프트 텍스트에서 ■ 섹션 내용을 추출하는 헬퍼
 * "■ [Lyrics] 칸 입력용:" 다음부터 다음 "■" 전까지의 텍스트를 가져옴
 * 왜: 사용자가 Suno에 직접 붙여넣을 때 해당 섹션만 깔끔하게 복사하기 위함
 */
function extractSection(text: string, sectionHeader: string): string {
    const headerIndex = text.indexOf(sectionHeader);
    if (headerIndex === -1) return '';

    // 헤더 뒤의 콜론(:) 이후부터 추출
    const afterHeader = text.substring(headerIndex + sectionHeader.length);
    const colonIdx = afterHeader.indexOf(':');
    const startContent = colonIdx !== -1 ? afterHeader.substring(colonIdx + 1) : afterHeader;

    // 다음 ■ 또는 --- 까지
    const nextSection = startContent.search(/\n■|\n---/);
    const content = nextSection !== -1 ? startContent.substring(0, nextSection) : startContent;

    return content.trim();
}

/** Exclude Styles 값만 추출 */
function extractExcludeStyles(text: string): string {
    const match = text.match(/Exclude Styles:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : '';
}

export function SunoFallbackGuide({ isOpen, onClose, brandData }: FallbackGuideProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    if (!isOpen) return null;

    const fallbackData = brandData || {
        archetype: '알 수 없음 (분석 임시 데이터)',
        keywords: ['트렌디한', '감각적인'],
        tags: 'Indie Pop, 120 BPM, clean electric guitar, bright synth plucks',
        promptTemplate: `[Intro: very short]\n[Verse 1]\n당신의 브랜드, 하늘로 띄워,\n막막한 마음에 정답을 지어\n[Chorus: Catchy Hook]\n(브랜드명!), 언제나 함께해\n[End]`
    };

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // 섹션별 텍스트 추출 (복사 버튼용)
    const promptText = fallbackData.promptTemplate;
    const lyricsText = extractSection(promptText, '■ [Lyrics]');
    const styleText = extractSection(promptText, '■ [Style of Music]');
    const excludeText = extractExcludeStyles(promptText);

    /** 섹션별 복사 버튼 컴포넌트 */
    const CopyButton = ({ label, text, copyKey }: { label: string; text: string; copyKey: string }) => (
        <button
            onClick={() => handleCopy(text, copyKey)}
            disabled={!text}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-full transition-colors"
        >
            {copiedKey === copyKey ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === copyKey ? '복사됨!' : label}
        </button>
    );

    return (
        /* 모달 백드롭 — CSS fadeIn */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            {/* 모달 카드 — CSS scaleIn */}
            <div className="relative w-full max-w-2xl overflow-hidden glass-panel rounded-3xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">마스터 프롬프트 생성 완료 (수동 모드)</h2>
                            <p className="text-sm text-gray-400">Gemini와 Suno에 붙여넣을 수 있는 맞춤형 프롬프트입니다.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-blue-200/90 text-sm leading-relaxed">
                        API 연동 전단계이므로 <strong>수동 투트랙 모드</strong>로 전환되었습니다.
                        <br />아래 <b>'제미나이 마스터 프롬프트'</b>를 복사하여 <b>Gemini 대화창</b>에 붙여넣으시면, AI가 브랜드 분석부터 Suno용 최종 프롬프트 최적화까지 한 번에 지시합니다!
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-yellow-200/90 text-sm leading-relaxed">
                        <span className="font-semibold text-yellow-400">💡 [하이브리드 모드 안내]</span>
                        <br />브랜드 고유의 <b>소닉 로고나 징글 음원 파일</b>이 있다면, 제미나이 대화창에 <b>프롬프트와 함께 첨부</b>해 주세요. AI가 Suno V5 연장(Extend) 기능에 최적화된 맞춤형 가이드를 즉시 제공합니다.
                    </div>

                    {/* Master Prompt Box */}
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between items-center">
                            <label className="text-sm font-semibold text-gray-300">제미나이 마스터 조종 프롬프트</label>
                            <CopyButton label="프롬프트 전체 복사" text={promptText} copyKey="master" />
                        </div>
                        <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-purple-300 whitespace-pre-wrap">
                            {promptText}
                        </pre>
                    </div>

                    {/* 섹션별 개별 복사 버튼 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suno 입력 칸별 빠른 복사</p>
                        <p className="text-xs text-gray-500 leading-relaxed">제미나이가 결과를 출력하면, 아래 버튼 대신 해당 결과를 직접 복사하세요.<br />아래는 프롬프트 원본의 안내 텍스트입니다.</p>
                        <div className="flex flex-wrap gap-2">
                            <CopyButton label="📝 Lyrics 복사" text={lyricsText} copyKey="lyrics" />
                            <CopyButton label="🎵 Style of Music 복사" text={styleText} copyKey="style" />
                            <CopyButton label="🚫 Exclude Styles 복사" text={excludeText} copyKey="exclude" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/60 flex justify-end gap-3">
                    <a
                        href="https://gemini.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl py-3 px-6 transition-all shadow-lg shadow-blue-500/20"
                    >
                        제미나이로 이동 <ChevronRight className="w-4 h-4" />
                    </a>
                    <a
                        href="https://suno.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl py-3 px-6 transition-all"
                    >
                        Suno AI로 이동 <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
