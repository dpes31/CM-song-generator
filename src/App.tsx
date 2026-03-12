import React, { useState } from 'react';
import { Music, Wand2, RefreshCw, Link, AlertCircle, Check } from 'lucide-react';
import { SunoFallbackGuide } from './components/SunoFallbackGuide';

/**
 * ──────────────────────────────────────────────────────────
 * [V6.0] Anti-Gravity — 6단계 Chip & Slider UI + V6.0 마스터 프롬프트
 *
 * Phase 1: Framer Motion 완전 제거 (스크롤 버그 영구 해결)
 * Phase 2: V6.0 프롬프트 엔진 + 6단계 Chip UI
 *   - CM송 테마, 필수 슬로건, 가사 언어, 장르(카테고리별), 무드
 *   - 악기(최대 3개), 템포(BPM 슬라이더), 보컬 상세, 입력 모드 A/B
 *   - 12원형은 백엔드(프롬프트) 전용 → UI에서 숨김
 * ──────────────────────────────────────────────────────────
 */

// ⎯⎯⎯⎯⎯ Chip 데이터 정의 (doc 12 기반) ⎯⎯⎯⎯⎯

/** 장르: 3개 카테고리로 분류 + 마케팅 의도 기반 주석 (doc 13) */
const GENRE_CATEGORIES = [
    {
        category: '🎤 대중적 & 트렌디',
        description: '최신 음악 트렌드에 맞는 세련된 스타일',
        items: [
            { id: 'kpop', label: 'K-Pop/J-Pop', desc: '1020 타깃 뷰티·패션·댄스 챌린지 광고' },
            { id: 'citypop', label: 'City Pop', desc: '드라이브·음료·감성 라이프스타일' },
            { id: 'synthwave', label: 'Synthwave/Retro', desc: 'IT 기기·뉴트로 마케팅' },
            { id: 'lofi', label: 'Lo-fi Hip-hop', desc: '카페·코스메틱·감성 광고' },
        ],
    },
    {
        category: '🏢 브랜딩 스타일',
        description: '기업·제품 홍보에 최적화된 안정적 스타일',
        items: [
            { id: 'acoustic', label: 'Acoustic/Folk', desc: '친환경·식품·신뢰감 기업 PR' },
            { id: 'corporate', label: 'Corporate/Minimal', desc: '애플/삼성 스타일 신제품 소개' },
            { id: 'funk', label: 'Funk/Nu-Disco', desc: '대형마트·패스트푸드·페스티벌' },
        ],
    },
    {
        category: '🔥 숏폼 & 바이럴 트렌드',
        description: '틱톡·쇼츠에 특화된 임팩트 있는 스타일',
        items: [
            { id: 'hyperpop', label: 'Hyperpop', desc: 'Z세대 에너지 음료·게임·밈 바이럴' },
            { id: 'phonk', label: 'Phonk', desc: '익스트림 스포츠·자동차·액션 숏폼' },
            { id: 'spedUp', label: 'Sped-up Dance', desc: '유쾌한 챌린지·릴스용 짧은 임팩트' },
        ],
    },
] as const;

/** 전반적인 무드 — AI 자동 옵션 포함 */
const MOOD_OPTIONS = [
    { id: 'auto', label: '🤖 AI 자동', eng: '' },
    { id: 'uplifting', label: '🌟 희망찬', eng: 'uplifting' },
    { id: 'cool', label: '❄️ 시원한', eng: 'cool and refreshing' },
    { id: 'warm', label: '☀️ 따뜻한', eng: 'warm' },
    { id: 'melancholic', label: '🌧️ 감성적인', eng: 'melancholic' },
    { id: 'tense', label: '⚡ 긴박한', eng: 'tense' },
    { id: 'cinematic', label: '🎬 웅장한', eng: 'cinematic, epic' },
    { id: 'playful', label: '🎈 통통 튀는', eng: 'playful, bouncy' },
    { id: 'luxurious', label: '💎 고급스러운', eng: 'luxurious, sophisticated' },
] as const;

/** 악기 구성 (최대 3개 선택) — 마케팅 의도 주석 포함 (doc 13) */
const INSTRUMENT_OPTIONS = [
    { id: 'bass808', label: '🎵 808 베이스', eng: 'heavy 808 bass', desc: '젊고 스포티한 타격감' },
    { id: 'brass', label: '🎺 브라스', eng: 'bright brass section', desc: '대규모 세일·이벤트 강조' },
    { id: 'piano', label: '🎹 피아노', eng: 'clean piano', desc: '감성 스토리텔링·고급 브랜드' },
    { id: 'guitar', label: '🎸 어쿠스틱 기타', eng: 'acoustic guitar', desc: '오가닉 브랜드·일상 공감' },
    { id: 'synth', label: '🎛️ 아날로그 신스', eng: 'analog synthesizer', desc: '미래지향적·세련된 분위기' },
] as const;

/** 보컬 상세 — 오토튠 삭제, Breathy/Belting 추가 (doc 13) */
const VOCAL_OPTIONS = [
    { id: 'auto', label: '🤖 AI 자동', eng: '', desc: '' },
    { id: 'powerFemale', label: '💃 파워풀 여성', eng: 'powerful female vocal, belting', desc: '뮤지컬·감동적 클라이맥스' },
    { id: 'huskyFemale', label: '🎤 허스키 여성', eng: 'husky airy female vocal', desc: '세련된 어반·재즈 분위기' },
    { id: 'breathy', label: '🌙 숨소리 보컬', eng: 'breathy soft vocal', desc: '화장품·향수·몽환적 광고' },
    { id: 'deepMale', label: '🎙️ 중저음 남성', eng: 'deep raspy male vocal', desc: '자동차·위스키·중후한 내레이션' },
    { id: 'belting', label: '🔥 파워풀 고음', eng: 'belting high-energy vocal', desc: '스포츠·자동차·폭발적 에너지' },
    { id: 'rapMale', label: '🔊 남성 랩', eng: 'rhythmic male rap vocal', desc: '스트릿 패션·에너지 브랜드' },
    { id: 'custom', label: '✏️ 직접 입력', eng: '', desc: '' },
] as const;

/** 가사 언어 */
const LANGUAGE_OPTIONS = [
    { id: 'auto', label: '🤖 AI 자동', sub: '최적의 언어 선정' },
    { id: 'ko', label: '🇰🇷 한국어', sub: '국내 대중성 특화' },
    { id: 'en', label: '🇺🇸 영어', sub: '글로벌/세련미' },
    { id: 'mix', label: '🌐 혼합', sub: '트렌디한 한+영' }
] as const;

// ⎯⎯⎯⎯⎯ 재사용 UI 컴포넌트 ⎯⎯⎯⎯⎯

/** 단일 선택 Chip 그룹 */
function ChipGroup({
    options,
    value,
    onChange,
    labelKey = 'label',
}: {
    options: readonly { id: string; label: string }[];
    value: string;
    onChange: (id: string) => void;
    labelKey?: string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        value === opt.id
                            ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                            : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {value === opt.id && <Check className="w-3.5 h-3.5" />}
                    {(opt as any)[labelKey] || opt.label}
                </button>
            ))}
        </div>
    );
}

/** 다중 선택 Chip 그룹 (최대 N개 제한) */
function MultiChipGroup({
    options,
    values,
    onChange,
    max,
}: {
    options: readonly { id: string; label: string }[];
    values: string[];
    onChange: (values: string[]) => void;
    max: number;
}) {
    const handleClick = (id: string) => {
        if (values.includes(id)) {
            onChange(values.filter((v) => v !== id));
        } else if (values.length < max) {
            onChange([...values, id]);
        }
        // 최대치 도달 시 더 이상 추가 안 됨 (UI에서 시각적으로 비활성화)
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const isSelected = values.includes(opt.id);
                const isDisabled = !isSelected && values.length >= max;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleClick(opt.id)}
                        disabled={isDisabled}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                                ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                : isDisabled
                                  ? 'bg-black/20 text-gray-600 border border-white/5 cursor-not-allowed opacity-50'
                                  : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

/** 섹션 파트 제목 UI (번호 + 제목) */
function SectionTitle({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
    return (
        <div className="border-b border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-purple-200">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs mr-2">{num}</span>
                {title}
            </h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1 ml-7">{subtitle}</p>}
        </div>
    );
}

// ⎯⎯⎯⎯⎯ 메인 App ⎯⎯⎯⎯⎯

function App() {
    // 기본 State
    const [brandName, setBrandName] = useState('');  // [01] 브랜드/제품명 (공통)
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFallback, setShowFallback] = useState(false);
    const [generatedBrandData, setGeneratedBrandData] = useState<any>(null);

    // 듀얼 트랙 모드
    const [isManualMode, setIsManualMode] = useState(false);

    // ── V6.0 6단계 입력 State ──
    const [theme, setTheme] = useState('');           // 1. CM송 테마
    const [isThemeAuto, setIsThemeAuto] = useState(true); // 1-1. 테마 AI 자동
    const [slogan, setSlogan] = useState('');          // 2. 필수 가사
    const [isSloganAuto, setIsSloganAuto] = useState(true); // 2-1. 슬로건 AI 자동
    const [language, setLanguage] = useState('ko');    // 3. 가사 언어
    const [selectedGenre, setSelectedGenre] = useState('auto'); // 4. 장르 (기본: AI 자동)
    const [customGenreText, setCustomGenreText] = useState('');
    const [selectedMood, setSelectedMood] = useState('auto'); // 5. 무드 (기본: AI 자동)
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]); // 6. 악기 (최대 3개)
    const [isInstrumentsAuto, setIsInstrumentsAuto] = useState(true); // 6-1. 악기 AI 자동
    const [tempo, setTempo] = useState(120);           // 7. BPM 슬라이더
    const [isTempoAuto, setIsTempoAuto] = useState(true); // 7-1. 템포 AI 자동 여부
    const [selectedVocal, setSelectedVocal] = useState('auto'); // 8. 보컬 (기본: AI 자동)
    const [customVocalText, setCustomVocalText] = useState('');
    const [inputMode, setInputMode] = useState<'idea' | 'fixed'>('idea'); // 9. 입력 모드
    const [fixedLyrics, setFixedLyrics] = useState('');

    // [02] URL 유효성 검사 헬퍼
    const isValidUrl = (text: string): boolean => {
        if (!text.trim()) return false;
        const trimmed = text.trim().toLowerCase();
        return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.');
    };

    // 단어 수 계산 헬퍼 — .split(/\s+/)는 공백·탭·줄바꿈 기준으로 분리
    // Suno AI는 공백 구분 단어(token) 기준으로 80단어 제한
    const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
    const isOverWordLimit = getWordCount(fixedLyrics) > 80;

    // BPM 수치에 대한 한글 라벨
    const getTempoLabel = (bpm: number): string => {
        if (bpm <= 85) return '느린 (발라드)';
        if (bpm <= 105) return '보통 (미디엄)';
        if (bpm <= 130) return '신나는 (업템포)';
        if (bpm <= 155) return '빠른 (댄스)';
        return '매우 빠른 (EDM/하이퍼)';
    };

    // 선택된 장르를 프롬프트용 텍스트로 변환
    const getGenreText = (): string => {
        if (selectedGenre === 'custom') return customGenreText || '알아서 추천';
        for (const cat of GENRE_CATEGORIES) {
            const found = cat.items.find((g) => g.id === selectedGenre);
            if (found) return found.label;
        }
        return '알아서 추천';
    };

    // 선택된 무드의 영문 값
    const getMoodEng = (): string => {
        const found = MOOD_OPTIONS.find((m) => m.id === selectedMood);
        return found ? found.eng : '';
    };

    // 선택된 악기들의 영문 값 (쉼표 연결)
    const getInstrumentsEng = (): string => {
        return selectedInstruments
            .map((id) => INSTRUMENT_OPTIONS.find((i) => i.id === id)?.eng)
            .filter(Boolean)
            .join(', ') || 'AI 자동 추천';
    };

    // 선택된 보컬의 영문 값
    const getVocalEng = (): string => {
        if (selectedVocal === 'custom') return customVocalText || 'AI 자동 추천';
        const found = VOCAL_OPTIONS.find((v) => v.id === selectedVocal);
        return found ? found.eng : 'AI 자동 추천';
    };

    // [04] 가사 언어 라벨 — 이모지 깨짐 방지를 위해 매핑 방식 사용
    const getLangLabel = (id: string) => {
        const labels: Record<string, string> = {
            auto: 'AI 자동 (분석 후 최적 언어 선택)',
            ko: '한국어',
            en: '영어',
            mix: '혼합 (한+영)'
        };
        return labels[id] || id;
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── [02][03] 강화된 유효성 검사 ──
        // 공통: 브랜드명은 반드시 필요
        if (!brandName.trim()) {
            alert('브랜드/제품명을 입력해주세요. (예: 새우깡, 닥터페퍼)');
            return;
        }

        // 오토 모드: URL 필수 + 형식 검증
        if (!isManualMode) {
            if (!url.trim()) {
                alert('오토 모드에서는 브랜드 웹사이트 URL이 필요합니다.');
                return;
            }
            if (!isValidUrl(url)) {
                alert('올바른 URL 형식을 입력해주세요.\n(예: www.drpepper.com 또는 https://www.drpepper.com)');
                return;
            }
        }

        // 매뉴얼 모드: URL 입력 시 형식 검증
        if (isManualMode && url.trim() && !isValidUrl(url)) {
            alert('URL 형식이 올바르지 않습니다.\nwww. 또는 http(s)://로 시작하는 주소를 입력해주세요.');
            return;
        }

        // 매뉴얼 + 가사 고정 모드: 가사 필수
        if (isManualMode && inputMode === 'fixed') {
            if (!fixedLyrics.trim()) {
                alert('가사 고정 모드에서는 가사를 반드시 입력해야 합니다.');
                return;
            }
            if (isOverWordLimit) {
                alert('가사가 80단어를 초과했습니다. Suno AI의 발음 뭉개짐(Rushing)을 방지하기 위해 줄여주세요.');
                return;
            }
        }

        setIsProcessing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (apiKey) {
                throw new Error('API Not Connected Yet');
            } else {
                const genreLabel = getGenreText();
                const moodEng = getMoodEng();
                const instrumentsEng = getInstrumentsEng();
                const vocalEng = getVocalEng();
                const langLabel = getLangLabel(language);

                /**
                 * ──────────────────────────────────────────────
                 * [V6.0] 마스터 프롬프트 — 6단계 Chip 데이터 통합
                 *
                 * [04] 미입력 항목은 프롬프트에서 생략 ("없음" 대신)
                 * 입력된 항목만 데이터 블록에 포함하여 AI가 불필요한
                 * "없음" 데이터에 혼란 받지 않도록 설계
                 * ──────────────────────────────────────────────
                 */

                // [04] 입력 모드별 데이터 블록 — 미입력 항목 생략 방식
                const buildDataLines = (): string => {
                    const lines: string[] = [];
                    lines.push(`- 브랜드/제품명: ${brandName}`);
                    if (url.trim()) lines.push(`- 브랜드 웹사이트: ${url}`);

                    if (isManualMode) {
                        // 매뉴얼 모드: 각 항목이 AI 자동이면 'AI 자동 추천'으로 표기
                        lines.push(`- CM송 테마: ${isThemeAuto ? 'AI 자동 추천' : (theme.trim() || 'AI 자동 추천')}`);
                        lines.push(`- 필수 가사: ${isSloganAuto ? 'AI 자동 추천' : (slogan.trim() || 'AI 자동 추천')}`);
                        lines.push(`- 가사 언어: ${langLabel}`);
                        lines.push(`- 장르 및 스타일: ${genreLabel}`);
                        lines.push(`- 전반적인 무드: ${selectedMood === 'auto' ? 'AI 자동 추천' : (moodEng || 'AI 자동 추천')}`);
                        lines.push(`- 악기 구성: ${isInstrumentsAuto ? 'AI 자동 추천' : instrumentsEng}`);
                        lines.push(`- 템포(BPM): ${isTempoAuto ? 'AI가 곡 분위기에 맞게 자동 결정' : `${tempo} BPM`}`);
                        lines.push(`- 보컬 상세: ${selectedVocal === 'auto' ? 'AI 자동 추천' : (vocalEng || 'AI 자동 추천')}`);
                        if (inputMode === 'idea') {
                            lines.push(`- 입력 모드: [옵션 A - 아이디어 모드]: AI가 위 데이터를 바탕으로 전체 가사 창작${(!isSloganAuto && slogan.trim()) ? ' (단, 필수 가사는 코러스에 100% 반영)' : ''}`);
                        } else {
                            lines.push(`- 입력 모드: [옵션 B - 가사 고정 모드]: 사용자 확정 가사를 100% 훼손 없이 그대로 사용`);
                            lines.push(`- 확정 가사: "${fixedLyrics}"`);
                        }
                    } else {
                        // 오토 모드: 모든 세부 필드를 AI 자동 추천으로 기재
                        lines.push(`- 가사 언어: ${langLabel}`);
                        lines.push(`- 세부 장르: AI 자동 추천`);
                        lines.push(`- 전반적인 무드: AI 자동 추천`);
                        lines.push(`- 악기 구성: AI 자동 추천`);
                        lines.push(`- 템포(BPM): AI가 곡 분위기에 맞게 자동 결정`);
                        lines.push(`- 보컬 상세: AI 자동 추천`);
                        lines.push(`- 입력 모드: [옵션 A - 아이디어 모드]: AI가 브랜드 에센스를 분석해 전체 가사 창작`);
                    }
                    return lines.join('\n');
                };

                const inputDataBlock = buildDataLines();

                const masterPrompt = `당신은 세계 최고의 B2C 상업용 소닉 브랜딩(Sonic Branding) 디렉터이자 Suno V5 시스템 아키텍트입니다.
사용자가 UI에서 선택한 아래 【사용자 입력 데이터】를 분석하여, 15~30초 분량의 소비자에게 강력하게 후킹되는 상업용 CM송(Jingle) 페이로드를 조립하십시오.

【사용자 입력 데이터】 ${inputDataBlock}

---
[STEP 1: 브랜드 DNA 분석 및 카피라이팅 전략 (내부 Blueprint)]
제공된 데이터를 바탕으로 마케팅 12원형(Innocent, Jester, Creator 등) 중 1개를 스스로 매핑하십시오.
- [카피라이팅 룰]:
  ${language === 'auto' ? '분석된 브랜드 톤앤매너에 최적화된 작법을 적용하십시오 (한국어인 경우 4음보/대구법, 영어인 경우 라임 중점).' : language === 'ko' ? '한국어 가사: 4음보 구조와 대구법, 의성어/의태어를 활용하십시오. 단순 나열을 피할 것.' : language === 'en' ? '영어 가사: 라임(rhyme)과 리듬감 있는 음절 배치. 간결하고 임팩트 있는 표현을 사용할 것.' : '혼합 가사: 한국어 파트는 4음보 구조, 영어 파트는 라임 기반. 언어 전환 지점은 에너지 변곡점에 배치할 것.'}
- 브랜드명/슬로건은 가장 에너지가 높은 [Chorus]에 자연스럽게 반복(Hook) 배치하십시오. 하이픈(-) 강제 사용은 금지합니다.

[STEP 2: Suno V5 Style 박스 조립 (프론트 로딩 & 120자 제한)]
사용자가 선택한 장르, 무드, 악기, 템포, 보컬 데이터를 영문으로 완벽히 번역하여 Style 태그를 조합하십시오.
- 공식(Front-loading): [Genre] + [Mood] + [BPM] + [2~3 Key Instruments] + [Vocal Persona]
- 악기 구성이 3개를 초과하지 않도록 압축하십시오 (음질 깨짐 방지).
- 예시: City Pop, 120 BPM, uplifting, bright synth and slap bass, airy female vocal

[STEP 3: 징글(Jingle) 구조 강제 조립 (Suno V5 Architecture)]
불필요한 전주(Intro)를 없애기 위해 가사 최상단에 반드시 아래 지시어를 넣으십시오.
[No Instrumental Breaks]
[Start immediately with full instrumental and vocals]

(구조 템플릿 - 전체 가사 60~80단어 이내)
[Intro: under 2 seconds, punchy]
[Verse 1: (무드 지시어 영문 삽입)]
(조건에 맞는 가사)
[Pre-Chorus: Build-Up]
[Energy: Explosive]
[Chorus: Catchy Hook, (보컬 창법 지시어 영문 삽입)]
(필수 슬로건이 포함된 강력한 훅 2줄)!
[Outro: punchy finish]
[End]

[STEP 4: AI 창의력(Sliders) 동적 할당 및 최종 결과물 출력]
선택된 장르에 따라 Weirdness(15~50)와 Style Influence(60~90) 값을 동적으로 계산하십시오.
(예: 클래식/기업PR은 보수적으로, 하이퍼팝/틱톡은 파격적으로)

<AI 창의력 동적 제어 가이드>
- 감성/품격 (럭셔리, 금융, 기업PR, IT 등): Weirdness 15~20 / Style Influence 85~90
- 대중/경쾌 (F&B, 뷰티, 소매, K-Pop 등): Weirdness 30 / Style Influence 70
- 숏폼/바이럴 특화 (밈, Z세대, 폰크, 하이퍼팝 등): Weirdness 45~50 / Style Influence 60

결과물은 사용자가 Suno.com 에 그대로 복사/붙여넣기 할 수 있도록 마크다운 없이 순수 텍스트로만 출력하십시오.
각 섹션 구분은 ■ 기호로 시작하십시오.

■ 브랜드 분석 요약 (Blueprint):
(도출된 12원형, 카피라이팅 전략 요약, 할당된 슬라이더 수치)

■ CM송 타이틀 제안:
(광고 크리에이티브 컨셉처럼 10자 이내 명사형 타이틀 3개를 제안. 예: "청량한 약속", "손끝의 쾌감", "에너지 폭발")

■ [Lyrics] 칸 입력용:
(STEP 3에서 완성된 [Start immediately...] 태그가 포함된 가사 원본)

■ [Style of Music] 칸 입력용:
(STEP 2에서 조합된 영문 태그)

■ [More Options] 설정 가이드:
- Exclude Styles: no synth pads, no ambient wash, no lo-fi, no vocal distortion, no long instrumental
- Weirdness: (계산된 수치)
- Style Influence: (계산된 수치)
- Make Instrumental: 꺼짐 (Off)
---`;

                setGeneratedBrandData({
                    archetype: '자동 추출 대기중...',
                    keywords: ['프롬프트를', '복사해서', '제미나이에 붙여넣으세요'],
                    tags: '프롬프트 내부 참고',
                    promptTemplate: masterPrompt,
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
        <div className="min-h-screen bg-[#030303] text-white relative overflow-x-clip font-sans selection:bg-purple-500/30">
            {/* 시안 3 메쉬 그라데이션 배경 */}
            <div className="mesh-gradient" />

            <main className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col pt-24">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-4 glass-premium rounded-3xl mb-8 shadow-2xl">
                        <Music className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-gradient">
                        CM송 제너레이터
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
                        브랜드의 DNA를 AI가 읽고,<br /> 최적의 상업용 음원을 즉시 창조합니다.
                    </p>
                </div>

                {/* Input Card Container */}
                <div className="max-w-3xl mx-auto w-full animate-fade-in-up animation-delay-200">
                    <form onSubmit={handleGenerate} className="glass-card">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-3xl" />

                        <div className="relative z-10 flex flex-col gap-6">

                            {/* 트랙 스위치 — 시안 3 프리미엄 스타일 */}
                            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 relative w-full overflow-hidden shadow-inner">
                                <div
                                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-white/20 rounded-xl transition-[left] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(140,37,244,0.3)]"
                                    style={{ left: isManualMode ? 'calc(50% + 3px)' : '6px' }}
                                />
                                <button type="button" onClick={() => setIsManualMode(false)}
                                    className={`flex-1 py-3.5 text-sm font-medium rounded-xl relative z-10 transition-all duration-300 ${!isManualMode ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                                    🔘 오토 모드 (Auto)
                                    <span className="block text-[10px] font-light opacity-50 mt-1 uppercase tracking-widest">URL Analysis</span>
                                </button>
                                <button type="button" onClick={() => setIsManualMode(true)}
                                    className={`flex-1 py-3.5 text-sm font-medium rounded-xl relative z-10 transition-all duration-300 ${isManualMode ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                                    🔘 매뉴얼 모드 (Manual) <span className="text-yellow-400 ml-1">✨Pro</span>
                                    <span className="block text-[10px] font-light opacity-50 mt-1 uppercase tracking-widest">맞춤형 제작</span>
                                </button>
                            </div>

                            {/* [01] 브랜드/제품명 입력 */}
                            <div className="group relative">
                                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="브랜드 또는 제품명 (예: 새우깡, 닥터페퍼)"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-light group-hover:bg-white/[0.05]"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                            </div>

                            {/* URL 입력 */}
                            <div className="group relative">
                                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                                    placeholder="브랜드 웹사이트 URL (예: www.drpepper.com)"
                                    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-light group-hover:bg-white/[0.05] ${!isManualMode ? 'border-blue-500/30 ring-1 ring-blue-500/20' : ''}`}
                                    required={!isManualMode}
                                />
                                <Link className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                                {isManualMode && <p className="text-[11px] text-white/30 mt-3 px-2 tracking-tight italic">* 매뉴얼 모드에서는 URL 입력이 선택 사항입니다.</p>}
                            </div>

                            {/* [03] 오토 모드: 가사 언어 선택 (매뉴얼 모드에서는 내부 섹션에 포함) */}
                            <div className={`transition-all duration-300 ease-in-out ${!isManualMode ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="pt-1">
                                    <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">가사 언어</label>
                                    <ChipGroup options={LANGUAGE_OPTIONS} value={language} onChange={(id) => setLanguage(id)} />
                                </div>
                            </div>

                            {/* ═══════════ 매뉴얼 모드: 6단계 Chip UI ═══════════ */}
                            <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isManualMode ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="space-y-10 py-4">

                                    {/* ① CM송 테마 */}
                                    <div className="space-y-4">
                                        <SectionTitle num={1} title="CM송 테마 (주제)" subtitle="AI가 곡의 전체 방향성과 가사 뉘앙스를 잡는 뼈대입니다" />
                                        <div className="flex flex-wrap gap-3">
                                            <button type="button" onClick={() => setIsThemeAuto(!isThemeAuto)}
                                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                                    isThemeAuto
                                                        ? 'bg-purple-600/40 text-white border border-purple-400/50 shadow-[0_0_15px_rgba(140,37,244,0.4)]'
                                                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/80'
                                                }`}>
                                                {isThemeAuto && <Check className="w-3.5 h-3.5" />}
                                                🤖 AI 자동
                                            </button>
                                        </div>
                                        <div className="mt-2 group relative">
                                            <input type="text" value={theme} 
                                                onChange={(e) => { setTheme(e.target.value); if (e.target.value.trim()) setIsThemeAuto(false); }}
                                                placeholder="예: 남녀노소 누구나 좋아하는 새우깡"
                                                disabled={isThemeAuto}
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all ${isThemeAuto ? 'opacity-40 select-none cursor-default' : 'opacity-100'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* ② 필수 가사 + 가사 언어 */}
                                    <div className="space-y-3">
                                        <SectionTitle num={2} title="필수 가사" subtitle="제품명 / 브랜드 / 슬로건 등 가사에 필수로 들어가야 하는 내용을 적어주세요" />
                                        <button type="button" onClick={() => setIsSloganAuto(!isSloganAuto)}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                isSloganAuto
                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}>
                                            {isSloganAuto && <Check className="w-3.5 h-3.5" />}
                                            🤖 AI 자동
                                        </button>
                                        <div className="mt-2">
                                            <input type="text" value={slogan} 
                                                onChange={(e) => { setSlogan(e.target.value); if (e.target.value.trim()) setIsSloganAuto(false); }}
                                                placeholder="예: 손이 가요 손이가 새우깡에 손이 가요"
                                                disabled={isSloganAuto || inputMode === 'fixed'}
                                                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all ${(isSloganAuto || inputMode === 'fixed') ? 'opacity-40 select-none cursor-default' : 'opacity-100'}`}
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">가사 언어</label>
                                            <ChipGroup
                                                options={LANGUAGE_OPTIONS}
                                                value={language}
                                                onChange={(id) => setLanguage(id)}
                                            />
                                        </div>
                                    </div>

                                    {/* ③ 가사 생성 방식 (A/B) */}
                                    <div className="space-y-3">
                                        <SectionTitle num={3} title="가사 생성 방식" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => setInputMode('idea')}
                                                className={`relative p-4 rounded-xl border text-left transition-all ${inputMode === 'idea' ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'border-white/10 bg-black/20 hover:bg-black/40'}`}>
                                                {inputMode === 'idea' && <div className="absolute top-2 right-2"><Check className="w-4 h-4 text-purple-400" /></div>}
                                                <span className="text-sm font-medium text-white block">🎨 아이디어 모드</span>
                                                <span className="text-xs text-gray-400 mt-1 block leading-relaxed">AI가 가사를 창작합니다</span>
                                            </button>
                                            <button type="button" onClick={() => setInputMode('fixed')}
                                                className={`relative p-4 rounded-xl border text-left transition-all ${inputMode === 'fixed' ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30' : 'border-white/10 bg-black/20 hover:bg-black/40'}`}>
                                                {inputMode === 'fixed' && <div className="absolute top-2 right-2"><Check className="w-4 h-4 text-purple-400" /></div>}
                                                <span className="text-sm font-medium text-white block">📝 가사 고정 모드</span>
                                                <span className="text-xs text-gray-400 mt-1 block leading-relaxed">내 가사 100% 사용</span>
                                            </button>
                                        </div>
                                        {/* 가사 고정 모드: 가사 입력 */}
                                        <div className={`transition-all duration-300 ease-in-out ${inputMode === 'fixed' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-medium text-gray-400 ml-1">확정 가사 입력</label>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isOverWordLimit ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {getWordCount(fixedLyrics)} / 80 단어
                                                    </span>
                                                </div>
                                                <textarea value={fixedLyrics} onChange={(e) => setFixedLyrics(e.target.value)} rows={3}
                                                    placeholder="CM송에 반드시 들어갈 가사를 입력하세요 (최대 80단어)"
                                                    className={`w-full bg-black/40 border ${isOverWordLimit ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all resize-none`}
                                                />
                                                {isOverWordLimit && (
                                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> 80단어 초과 시 Suno AI 발음 뭉개짐 발생
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ④ 장르 선택 — AI 자동 + 카테고리별 Chip + 마케팅 의도 주석 */}
                                    <div className="space-y-4">
                                        <SectionTitle num={4} title="장르 및 스타일" subtitle="AI가 테마에 맞는 장르를 추천하거나, 원하는 장르를 직접 선택하세요" />
                                        {/* AI 자동 추천 */}
                                        <button type="button" onClick={() => setSelectedGenre('auto')}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                selectedGenre === 'auto'
                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}>
                                            {selectedGenre === 'auto' && <Check className="w-3.5 h-3.5" />}
                                            🤖 AI 자동
                                        </button>
                                        {GENRE_CATEGORIES.map((cat) => (
                                            <div key={cat.category} className="space-y-2">
                                                <p className="text-xs font-medium text-gray-400 ml-1">{cat.category} <span className="text-gray-600">— {cat.description}</span></p>
                                                <div className="flex flex-wrap gap-x-2 gap-y-3">
                                                    {cat.items.map((genre) => (
                                                        <button key={genre.id} type="button" onClick={() => setSelectedGenre(genre.id)}
                                                            className={`group relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                                selectedGenre === genre.id
                                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                                            }`}>
                                                            <span className="flex items-center gap-1.5">
                                                                {selectedGenre === genre.id && <Check className="w-3.5 h-3.5" />}
                                                                {genre.label}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 font-normal">{genre.desc}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {/* 직접 입력 옵션 */}
                                        <button type="button" onClick={() => setSelectedGenre('custom')}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                selectedGenre === 'custom'
                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10'
                                            }`}>
                                            {selectedGenre === 'custom' && <Check className="w-3.5 h-3.5" />}
                                            ✏️ 직접 입력
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${selectedGenre === 'custom' ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <input type="text" value={customGenreText} onChange={(e) => setCustomGenreText(e.target.value)}
                                                placeholder="원하는 장르를 자유롭게 입력 (예: 어쿠스틱 포크, 레게)"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* ⑤ 무드 */}
                                    <div className="space-y-3">
                                        <SectionTitle num={5} title="전반적인 무드" subtitle="곡의 감정선과 코드 진행을 결정합니다" />
                                        <ChipGroup options={MOOD_OPTIONS} value={selectedMood} onChange={setSelectedMood} />
                                    </div>

                                    {/* ⑥ 악기 구성 (AI 자동 + 최대 3개) */}
                                    <div className="space-y-3">
                                        <SectionTitle num={6} title="악기 구성" subtitle="최대 3개 선택 (초과 시 음질 깨짐 방지)" />
                                        <button type="button" onClick={() => { setIsInstrumentsAuto(!isInstrumentsAuto); if (!isInstrumentsAuto) setSelectedInstruments([]); }}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                isInstrumentsAuto
                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}>
                                            {isInstrumentsAuto && <Check className="w-3.5 h-3.5" />}
                                            🤖 AI 자동
                                        </button>
                                        <div className={`transition-all duration-300 ease-in-out ${!isInstrumentsAuto ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <MultiChipGroup options={INSTRUMENT_OPTIONS} values={selectedInstruments}
                                                onChange={setSelectedInstruments} max={3} />
                                            <p className="text-xs text-gray-500 ml-1 mt-2">선택: {selectedInstruments.length}/3개</p>
                                        </div>
                                    </div>

                                    {/* ⑦ 템포 (AI 자동 + BPM 슬라이더) */}
                                    <div className="space-y-3">
                                        <SectionTitle num={7} title={isTempoAuto ? '템포 — AI 자동' : `템포 — ${tempo} BPM`} subtitle={isTempoAuto ? 'AI가 곡 분위기에 맞는 최적 BPM을 결정합니다' : getTempoLabel(tempo)} />
                                        {/* AI 자동 토글 */}
                                        <button type="button" onClick={() => setIsTempoAuto(!isTempoAuto)}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                isTempoAuto
                                                    ? 'bg-purple-500/30 text-white border border-purple-400/50 ring-1 ring-purple-400/20'
                                                    : 'bg-black/30 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}>
                                            {isTempoAuto && <Check className="w-3.5 h-3.5" />}
                                            🤖 AI 자동
                                        </button>
                                        {/* BPM 슬라이더 — 항상 표시 (회장님 요청) */}
                                        <div className="flex items-center gap-4 px-1">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">느린 (70)</span>
                                            <input type="range" min="70" max="180" step="5" value={tempo}
                                                onChange={(e) => { setTempo(Number(e.target.value)); setIsTempoAuto(false); }}
                                                className={`w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 ${isTempoAuto ? 'opacity-40' : 'opacity-100'} transition-opacity`}
                                            />
                                            <span className="text-xs text-gray-500 whitespace-nowrap">빠른 (180)</span>
                                        </div>
                                    </div>

                                    {/* ⑧ 보컬 상세 */}
                                    <div className="space-y-3">
                                        <SectionTitle num={8} title="보컬 상세" />
                                        <ChipGroup options={VOCAL_OPTIONS} value={selectedVocal} onChange={setSelectedVocal} />
                                        <div className={`transition-all duration-300 ease-in-out ${selectedVocal === 'custom' ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <input type="text" value={customVocalText} onChange={(e) => setCustomVocalText(e.target.value)}
                                                placeholder="예: 아이의 맑은 목소리, 두 명의 하모니"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* API Key */}
                            <div className="relative">
                                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Gemini API Key (선택: 비워두면 수동 모드)"
                                    className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                                />
                            </div>

                            {/* 제출 버튼 */}
                            <button type="submit" disabled={isProcessing || !brandName.trim() || (!isManualMode && !url.trim())}
                                className="group relative inline-flex items-center justify-center bg-white text-black font-semibold rounded-2xl py-4 px-8 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                                <span className="relative z-10 flex items-center gap-2">
                                    {isProcessing ? (
                                        <><RefreshCw className="w-5 h-5 animate-spin" /> 분석 중...</>
                                    ) : (
                                        <><Wand2 className="w-5 h-5 transition-transform group-hover:rotate-12" /> 🚀 맞춤형 CM송 기획안 생성하기</>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Fallback Guide Modal */}
            <SunoFallbackGuide isOpen={showFallback} onClose={() => setShowFallback(false)} brandData={generatedBrandData} />
        </div>
    );
}

export default App;
