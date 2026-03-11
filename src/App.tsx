import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Upload, Wand2, RefreshCw, Link, ChevronDown, AlertCircle } from 'lucide-react';
import { SunoFallbackGuide } from './components/SunoFallbackGuide';

function App() {
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    // 듀얼 트랙 모드 State
    const [isManualMode, setIsManualMode] = useState(false); // false: 오토, true: 매뉴얼

    // 매뉴얼 모드 입력 State
    const [manualBenefit, setManualBenefit] = useState('');
    const [manualTarget, setManualTarget] = useState('');
    const [manualKeywords, setManualKeywords] = useState('');
    const [manualGenre, setManualGenre] = useState('알아서 추천');
    const [useStaccato, setUseStaccato] = useState(false); // 타격감/음절 훈련 옵션

    // 단어 수 계산 헬퍼
    const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
    const isOverWordLimit = getWordCount(manualKeywords) > 80;

    // Fallback UI에 주입할 상태 데이터 (수동 마스터 프롬프트 모드)
    const [generatedBrandData, setGeneratedBrandData] = useState<any>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        // 오토 모드일 땐 URL 필수, 매뉴얼 모드일 땐 URL 선택 허용이나 둘 다 비면 안 됨
        if (!isManualMode && !url.trim()) return;
        if (isManualMode && isOverWordLimit) {
            alert("필수 포함 가사가 80단어를 초과했습니다. AI의 발음 뭉개짐(Rushing)을 방지하기 위해 줄여주세요.");
            return;
        }

        setIsProcessing(true);

        try {
            // 인위적 지연 (로딩 UI 시뮬레이션)
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (apiKey) {
                // [API 모드] - 추후 Gemini API 실제 호출 추가 예정
                console.log('API 연동 모드 실행', apiKey);
                // 현재는 API가 연결되지 않았다고 가정하고 수동 모드로 폴백
                throw new Error('API Not Connected Yet');
            } else {
                // [수동 모드] - 제미나이 마스터 프롬프트 생성용 Mock 분석
                console.log(`[Manual Mode] 프롬프트 조립 시작`);

                const inputModeStr = isManualMode ? `
- 입력 모드: [매뉴얼 Track B] 최우선 기획(Override) 진행
- 브랜드/제품 URL: ${url || '없음'}
- 제품 핵심 혜택: ${manualBenefit || '없음'}
- 필수 포함 가사: ${manualKeywords || '없음'}
- 타깃 고객층: ${manualTarget || '없음'}
- 희망 장르 카테고리: ${manualGenre}
- 타격감(Staccato) 지시: ${useStaccato ? '적용 필' : '없음'}
` : `
- 입력 모드: [오토 Track A] URL 분석 기반 자동 기획
- 브랜드/제품 URL: ${url}
`;

                // 마스터 프롬프트 조립 (Mega-Prompt V4.0 - Dual Track & Target Genre Mapping)
                const masterPrompt = `당신은 세계 최고의 B2B 상업용 소닉 브랜딩(Sonic Branding) 디렉터이자 Suno V5 시스템 아키텍트입니다. 
다음 【분석 대상 데이터】를 분석하여, 완벽히 통제된 Suno V5 API 페이로드를 조립하십시오.

【분석 대상 데이터】 ${inputModeStr}

---
[STEP 0: 입력 모드 판단 및 능동형 방어]
사용자가 URL만 제공했다면 링크를 분석해 브랜드 에센스를 파악하십시오. 정보가 부족하다면 작업을 멈추고 "정보가 부족합니다. 제품의 핵심 혜택을 알려주세요"라고 질문하십시오. 
사용자가 매뉴얼 값(필수 가사, 타깃, 장르)을 입력했다면, 이를 최우선(Override)으로 반영하여 기획하십시오.

[STEP 1: 브랜드 DNA 추출 및 12원형 매핑 (Blueprint 도출)]
URL과 타깃 고객을 분석하여 12가지 브랜드 원형(평범한 사람, 창조자, 영웅 등) 중 1가지를 매칭하고, 톤앤매너 키워드 3가지를 영문으로 추출하십시오.

[STEP 2: Suno V5 Style 박스 조합 (영문 120자 이내 Strict)]
사용자가 선택한 【희망 장르 카테고리】에 맞춰 아래의 [장르 매핑 가이드]를 참고하여 Style 태그를 조합하십시오. (사용자가 '알아서 추천'을 택했다면 STEP 1의 원형에 가장 잘 맞는 것을 고르십시오)

<장르 매핑 가이드 (Target Genre Matrix)>
1. 대중/경쾌 (F&B, 소매, 뷰티): K-Pop, City Pop, Bubblegum Pop, High-Energy Funk / 110-130 BPM / bright synths, snappy bass / upbeat smiling pop vocal
2. 강렬/현대 (IT, 스포츠, 자동차): Minimalist Tech, Dark Trap, Hard Rock / 130-150 BPM / distorted 808s, cold analog pads / powerful belted vocal
3. 감성/품격 (럭셔리, 금융, 기업PR): Cinematic Orchestral, Dark R&B, Lo-Fi Jazz / 80-95 BPM / grand piano, warm strings / close-mic breathy vocal
4. 숏폼/바이럴 특화 (밈, 틱톡 챌린지): Drift Phonk, Hyperpop, Bedroom Pop / 140+ BPM or 90 BPM / cowbell melody, glitch effects, tape noise / playful or rhythmic vocal

- 조합 공식: [Genre/Era] + [BPM] + [Mood] + [2~3 Key Instruments] + [Vocal Persona] + [Production Mix]
- 유명 아티스트 이름(예: BTS 등)은 저작권 차단을 막기 위해 절대 포함 금지.

[STEP 3: 가사 및 메타태그 엔지니어링 ★핵심 제약 조건★]
[Word Count Strict Rule]: 30초 분량에 맞추기 위해, 전체 가사는 반드시 60~80단어(한국어 기준 6~8줄) 이내로 절대 제한하십시오.

- 조건 A (영어): 'AABB End-Rhyme'과 '음절 수학(Melodic Math)'. 각 줄 음절 수 대칭 유지.
- 조건 B (한국어): '4음보' 및 '3·4조/4·4조' 적용. (예: OOO(3), OOOO(4), OOO(3), OOOO(4))
- [하이브리드 가사 조립 (Anchor & Build-up)]: 사용자가 '필수 포함 가사'를 주었다면 곡의 심장부인 [Chorus]에 토씨 하나 틀리지 않고 앵커링(Anchoring) 하십시오. 그리고 나머지 구간([Verse], [Pre-Chorus])은 URL 및 브랜드 DNA 분석 결과를 바탕으로 AI가 문맥에 맞게 매력적으로 빌드업(Build-up) 창작하십시오.
- 딕션 기호: 마침표(.) 금지. 호흡 끊을 곳에만 쉼표(,) 사용. ${useStaccato ? '브랜드명 부분에 타격감을 부여하기 위해 하이픈(-) 기호를 적극 활용하여 또박또박 발음하게 만드십시오.' : ''}

[STEP 4: 구조 조립 (Suno 가사 프레임워크)]
[Intro: very short, under 2 seconds, punchy]
[Verse 1: (무드 지시어 영문 삽입)]
(AI가 브랜드 DNA 기반으로 자체 창작한 서사 빌드업 가사 2~3줄)
[Pre-Chorus: Build-Up]
[Energy: Explosive]
[Chorus: Catchy Hook, (보컬 창법 지시어 영문 삽입)]
(사용자가 입력한 '필수 포함 가사' 원문 그대로 앵커링 1~2줄)!
[Outro: punchy finish]
[End]

[STEP 5: 최종 결과물 (Suno 웹사이트 수동 입력용)]
사용자가 Suno.com에 복사/붙여넣기 할 수 있도록 마크다운 없이 순수 텍스트로만 출력하십시오.

■ [브랜드 분석 요약 (Blueprint)]:
(도출된 에센스, 타깃(${isManualMode ? '매뉴얼 값 우선' : 'URL 분석 기반'}), 12원형, 코어 메시지, 선택된 장르('${manualGenre}') 세부 요약)

■ [Title] 칸 입력용:
(브랜드명_CMSong)

■ [Lyrics] 칸 입력용:
(STEP 4에서 완성된 가사 원본)

■ [Style of Music] 칸 입력용:
(STEP 2에서 조합된 120자 이내 태그)

■ [Exclude Styles] 칸 입력용:
no synth pads, no ambient wash, no lo-fi, no vocal distortion

■ Suno V5 [More Options] 설정 가이드:
- Make Instrumental: 꺼짐 (Off) 설정 유지

[STEP 6: 하이브리드 모드 (소닉 로고 첨부 시 추가 지침)]
사용자가 이 프롬프트와 함께 '오디오 파일(소닉 로고 또는 징글)'을 첨부하여 요청했다면, 출력 결과물 맨 마지막에 [💡 하이브리드 모드 안내] 단락을 추가하여 다음을 안내하십시오:
"첨부하신 소닉 로고는 Suno V5의 'Audio Input' 기능이나 'Extend(연장)' 기능을 통해 도입부(Intro) 혹은 아웃트로(Outro)에 배치할 수 있습니다. 위 프롬프트를 Suno에 입력하실 때, 첨부한 음원 파일을 먼저 업로드하고 Audio Influence를 0.10 ~ 0.20 정도로 낮게 설정하여 원본 사운드의 해상도를 유지하십시오."
---`;

                setGeneratedBrandData({
                    archetype: '자동 추출 대기중...',
                    keywords: ['프롬프트를', '복사해서', '제미나이에 붙여넣으세요'],
                    tags: '프롬프트 내부 참고',
                    promptTemplate: masterPrompt
                });

                setShowFallback(true);
            }

        } catch (error) {
            console.error('Task Error:', error);
            setShowFallback(true);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />

            <main className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col pt-24">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-3 glass rounded-full mb-6">
                        <Music className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white">
                        CM송 제너레이터
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide">
                        브랜드 URL만 입력하면, AI가 최적의 브랜드 톤앤매너로 B2B 상업용 음원을 즉시 창조합니다.
                    </p>
                </motion.div>

                {/* Input Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-3xl mx-auto w-full"
                >
                    <form onSubmit={handleGenerate} className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                        {/* Input Overlay Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col gap-6">

                            {/* Track Selection Switch UI */}
                            <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 relative w-full overflow-hidden">
                                <motion.div
                                    className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl"
                                    animate={{ left: isManualMode ? 'calc(50% + 3px)' : '6px' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsManualMode(false)}
                                    className={`flex-1 py-3 text-sm font-medium rounded-xl relative z-10 transition-colors ${!isManualMode ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    🔘 오토 모드 (Auto)
                                    <span className="block text-xs font-light opacity-60 mt-0.5">URL 분별 기반 자동 기획</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsManualMode(true)}
                                    className={`flex-1 py-3 text-sm font-medium rounded-xl relative z-10 transition-colors ${isManualMode ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    🔘 매뉴얼 모드(Manual) <span className="text-yellow-400 ml-1">✨Pro</span>
                                    <span className="block text-xs font-light opacity-60 mt-0.5">디테일 컨트롤 및 옵션 입력</span>
                                </button>
                            </div>

                            <div className="flex-1 space-y-4 relative">
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="브랜드 웹사이트 URL을 입력하세요 (예: https://www.drpepper.com/)"
                                            className={`w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 pl-12 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light ${!isManualMode ? 'border-blue-500/30 ring-1 ring-blue-500/20' : ''}`}
                                            required={!isManualMode}
                                        />
                                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {isManualMode && <p className="text-xs text-gray-500 mt-2 px-2">* 매뉴얼 모드에서는 URL 입력이 선택 사항입니다.</p>}
                                </div>

                                {/* Manual Mode Core Input Section */}
                                <AnimatePresence>
                                    {isManualMode && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, y: -10 }}
                                            animate={{ height: "auto", opacity: 1, y: 0 }}
                                            exit={{ height: 0, opacity: 0, y: -10 }}
                                            className="border border-white/10 rounded-2xl bg-white/5 overflow-clip"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* 기본 정보 */}
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-semibold text-purple-200 border-b border-white/10 pb-2">1. 브랜드 DNA 데이터</h3>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">제품의 핵심 혜택 (Core Benefit)</label>
                                                        <input
                                                            type="text"
                                                            value={manualBenefit}
                                                            onChange={(e) => setManualBenefit(e.target.value)}
                                                            placeholder="예: 칼로리 없는 치명적인 달콤함"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">타깃 고객층 (Target Audience)</label>
                                                        <input
                                                            type="text"
                                                            value={manualTarget}
                                                            onChange={(e) => setManualTarget(e.target.value)}
                                                            placeholder="예: 20대 여성, 직장인, Z세대 학생 등"
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* 가사 통제 */}
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-semibold text-purple-200 border-b border-white/10 pb-2 flex justify-between items-center">
                                                        <span>2. 가사 및 슬로건 통제</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isOverWordLimit ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                            {getWordCount(manualKeywords)} / 80 단어
                                                        </span>
                                                    </h3>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">필수 포함 가사 / 슬로건 (Mandatory Lyrics)</label>
                                                        <textarea
                                                            value={manualKeywords}
                                                            onChange={(e) => setManualKeywords(e.target.value)}
                                                            rows={2}
                                                            placeholder="후렴구(Chorus)에 반드시 들어갈 문장을 길지 않게 입력하세요. (최대 80단어)"
                                                            className={`w-full bg-black/40 border ${isOverWordLimit ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all resize-none custom-scrollbar`}
                                                        />
                                                        {isOverWordLimit && (
                                                            <p className="text-xs text-red-400 mt-1.5 ml-1 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> 80단어 임계값을 초과했습니다. AI 발음 테스트를 위해 가사를 줄여주세요.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <label className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-black/40 transition-colors group">
                                                        <div className="flex h-5 items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={useStaccato}
                                                                onChange={(e) => setUseStaccato(e.target.checked)}
                                                                className="w-4 h-4 rounded border-gray-500 text-purple-500 focus:ring-purple-500/50 bg-black"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-200">AI 보컬 타격감/음절 훈련 적용</span>
                                                            <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">체크 시 <span className="text-yellow-400">안-티-그-래-비-티</span> 처럼 스타카토 형식으로 하이픈을 강제 삽입하여 리듬감 있게 훅(Hook)을 살립니다.</span>
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* 장르 선택 */}
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-semibold text-purple-200 border-b border-white/10 pb-2">3. 타깃 장르 선택 가이드</h3>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">희망 장르 카테고리 (4대 상업용 분류)</label>
                                                        <div className="relative">
                                                            <select
                                                                value={manualGenre}
                                                                onChange={(e) => setManualGenre(e.target.value)}
                                                                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer"
                                                            >
                                                                <option value="알아서 추천">🤖 Anti-Gravity AI 알아서 추천 (12원형 매핑)</option>
                                                                <option value="1. 대중/경쾌">1. 대중/경쾌 (F&B, 소매, 뷰티 - K-Pop, 펑크 등)</option>
                                                                <option value="2. 강렬/현대">2. 강렬/현대 (IT, 스포츠 - 테크노, 하드록 등)</option>
                                                                <option value="3. 감성/품격">3. 감성/품격 (럭셔리, 금융 - 시네마틱, 재즈 등)</option>
                                                                <option value="4. 숏폼/바이럴 특화">4. 숏폼/바이럴 특화 (틱톡 밈, 챌린지 - 폰크, 하이퍼팝 등)</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Gemini API Key (선택: 비워두면 수동 제미나이 복사 모드)"
                                        className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing || !url.trim()}
                                className="group relative inline-flex items-center justify-center bg-white text-black font-semibold rounded-2xl py-4 px-8 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed h-fit self-start md:mt-0 mt-4"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            추출 중...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                            음원 생성하기
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>

                        {/* Separator / Hybrid Upload Options */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Upload className="w-5 h-5" />
                                <span className="text-sm font-medium">소닉 로고/징글 음원이 있으신가요? (하이브리드 모드)</span>
                            </div>
                            <button
                                type="button"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-400/30 hover:border-blue-400/60 rounded-full px-4 py-2 bg-blue-400/5 hover:bg-blue-400/10"
                            >
                                음원 파일 업로드
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>

            {/* Fallback Guide Modal */}
            <SunoFallbackGuide
                isOpen={showFallback}
                onClose={() => setShowFallback(false)}
                brandData={generatedBrandData}
            />
        </div>
    );
}

export default App;
