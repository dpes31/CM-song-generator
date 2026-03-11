import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, CheckCircle2, ChevronRight, X } from 'lucide-react';

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
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl overflow-hidden glass-panel rounded-3xl"
                >
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
                            <br />아래 <b>'제미나이 마스터 프롬프트'</b>를 복사하여 <b>Gemini 대화창</b>에 붙여넣으시면, AI가 브랜드 12원형 분석부터 Suno용 최종 프롬프트 최적화까지 한 번에 지시합니다!
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-yellow-200/90 text-sm leading-relaxed">
                            <span className="font-semibold text-yellow-400">💡 [하이브리드 모드 안내]</span>
                            <br />브랜드 고유의 <b>소닉 로고나 징글 음원 파일</b>이 있다면, 제미나이 대화창에 <b>프롬프트와 함께 첨부</b>해 주세요. AI가 Suno V5 연장(Extend) 기능에 최적화된 맞춤형 가이드를 즉시 제공합니다.
                        </div>

                        {/* Master Prompt Box */}
                        <div className="space-y-2">
                            <div className="flex flex-row justify-between items-center">
                                <label className="text-sm font-semibold text-gray-300">제미나이 마스터 조종 프롬프트 (복사해서 붙여넣으세요)</label>
                                <button
                                    onClick={() => handleCopy(fallbackData.promptTemplate, 'master')}
                                    className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    {copiedKey === 'master' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedKey === 'master' ? '복사됨!' : '프롬프트 전체 복사'}
                                </button>
                            </div>
                            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-purple-300 whitespace-pre-wrap">
                                {fallbackData.promptTemplate}
                            </pre>
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
