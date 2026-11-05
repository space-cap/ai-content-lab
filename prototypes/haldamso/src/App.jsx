import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, Pause, Volume2, RotateCcw, Heart, Send, 
  Sparkles, CheckCircle2, Award, User, Utensils, MessageSquare, 
  ChevronRight, ArrowLeft, ShieldCheck, Gift, VolumeX, Camera, 
  Music, Share2, Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 초기 청년 고민 데이터
const INITIAL_WORRIES = [
  {
    id: 1,
    category: '취업/진로',
    youthName: '김민수 (26세 취준생)',
    title: '서류 32번째 탈락... 라면만 먹다 울컥했습니다',
    content: '부모님 볼 면목도 없고, 자존감은 바닥을 칩니다. 오늘 저녁도 컵라면 하나 끓여 먹는데 왜 이렇게 눈물이 나는지... 제가 정말 세상에 쓸모없는 사람일까요? 다시 일어설 용기가 안 납니다.',
    preferredMentor: '옥분 할머니',
    status: 'WAITING',
    date: '방금 전'
  },
  {
    id: 2,
    category: '번아웃/인간관계',
    youthName: '이서연 (28세 직장인 2년차)',
    title: '직장에서 혼자만 겉도는 기분이고 모든 게 버거워요',
    content: '열심히 한다고 했는데 실수투성이고, 동기들은 앞서 나가는데 저만 정체된 것 같습니다. 퇴근길 지하철에서 숨이 턱 막히는 것 같아요. 인생 선배님의 지혜를 빌려주세요.',
    preferredMentor: '덕배 할아버지',
    status: 'WAITING',
    date: '10분 전'
  },
  {
    id: 3,
    category: '연애/이별',
    youthName: '박준혁 (25세 대학생)',
    title: '5년 만난 연인과 헤어지고 세상이 무너졌습니다',
    content: '취업 준비로 바쁘다 보니 서로 소홀해졌고 결국 어제 끝났습니다. 밥도 안 넘어가고 아무것도 손에 잡히질 않네요. 어떻게 이 시간을 견뎌야 할까요.',
    preferredMentor: '순자 할머니',
    status: 'WAITING',
    date: '30분 전'
  }
];

// 청년에게 도착한 선물 샘플 데이터 (SCR-Y03 용)
const INITIAL_INBOX_GIFT = {
  id: 'gift-001',
  mentorName: '옥분 할머니 (따뜻한 위로형)',
  mentorAudioText: '아가야, 봄꽃이 일찍 핀다고 가을 국화가 슬퍼하더냐. 살아보니 인생은 속도가 아니라 방향이더라. 넘어진 건 실패가 아니라 잠시 쉬어가는 정거장이야. 굶지 말고 이 국밥 든든하게 챙겨 먹고 다시 툭툭 털고 일어나렴. 할미가 늘 뒤에서 응원한다.',
  audioDuration: '01:24',
  gifticonName: '모바일 따뜻한 국밥 한상 10,000원권',
  gifticonBarcode: '2026 - 1104 - 8892 - 7741',
  gifticonBrand: '배달의민족 x 옥분 할머니',
  sponsorName: '배달의민족 (우아한형제들)',
  receivedAt: '방금 전 도착'
};

// 완료된 감동 스토리 (보람 피드 & 명예의 전당)
const INITIAL_STORIES = [
  {
    id: 101,
    mentorName: '옥분 할머니',
    mentorAudioText: '아가야, 봄꽃이 일찍 핀다고 가을 국화가 슬퍼하더냐. 살아보니 인생은 속도가 아니라 방향이더라. 굶지 말고 든든히 먹어라.',
    youthName: '강태양 (27세 청년)',
    sponsorName: '배달의민족 (우아한형제들)',
    foodPhoto: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80',
    letterContent: '할머니! 보내주신 국밥 한 그릇 정말 국물 한 방울 안 남기고 싹 비웠습니다. 목소리 듣고 국밥집에서 펑펑 울었어요. 말씀대로 기운 차리고 다시 이력서 쓰겠습니다. 평생 잊지 않겠습니다!',
    date: '오늘 18:30'
  }
];

// 샘플 완식 사진 목록 (업로드 시뮬레이션용)
const SAMPLE_FOOD_PHOTOS = [
  'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80'
];

export default function App() {
  // 모드 상태: 'SENIOR' (어르신) | 'YOUTH' (청년) | 'HALL' (명예의 전당)
  const [userMode, setUserMode] = useState('SENIOR');
  
  // 어르신 모드 단계: 'FEED' | 'RECORDER' | 'COMPLETED' | 'MY_STORIES'
  const [seniorStep, setSeniorStep] = useState('FEED');
  const [selectedWorry, setSelectedWorry] = useState(null);

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // TTS (음성 낭독) 상태
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 청년 모드 단계: 'WRITE' (고민작성) | 'INBOX' (선물수신뷰어) | 'THANK_YOU' (완식인증작성)
  const [youthTab, setYouthTab] = useState('INBOX'); // 기본을 선물 수신 뷰어로 보여주어 감동 체감 극대화
  const [youthCategory, setYouthCategory] = useState('취업/진로');
  const [youthTitle, setYouthTitle] = useState('');
  const [youthContent, setYouthContent] = useState('');
  const [youthMentor, setYouthMentor] = useState('옥분 할머니');
  const [youthPhone, setYouthPhone] = useState('');
  const [youthSubmitted, setYouthSubmitted] = useState(false);

  // 청년 완식 감사 편지 작성 상태
  const [thankPhotoIndex, setThankPhotoIndex] = useState(0);
  const [thankLetter, setThankLetter] = useState(
    '할머니, 보내주신 따뜻한 국밥 한 그릇 정말 눈물 흘리며 다 비웠습니다. 할머니 음성 들으면서 그동안 얼어붙었던 마음이 스르르 녹아내리는 기분이었어요. 툭툭 털고 내일부터 다시 자소서 쓰겠습니다. 꼭 멋진 사회인이 되어 할머니처럼 베푸는 어른이 될게요. 정말 감사드립니다!'
  );
  const [isPlayingMentorVoice, setIsPlayingMentorVoice] = useState(false);

  // 데이터 리스트
  const [worries, setWorries] = useState(INITIAL_WORRIES);
  const [stories, setStories] = useState(INITIAL_STORIES);

  // 녹음 타이머
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 180) { // 3분 제한
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // TTS 고민 읽어주기 기능
  const speakText = (text, rate = 0.9) => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 낭독 기능을 지원하지 않습니다.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlayingMentorVoice(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = rate;
    utterance.pitch = 0.95; // 따뜻하고 깊은 음색
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlayingMentorVoice(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlayingMentorVoice(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // 마이크 녹음 시작
  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setRecordSeconds(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        setIsRecording(true);
      }
    } catch (err) {
      console.warn('마이크 접근 제한, 시뮬레이션 녹음으로 전환:', err);
      setIsRecording(true);
    }
  };

  // 마이크 녹음 종료
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setAudioUrl('SIMULATED_AUDIO');
    }
  };

  // 어르신 조언 최종 제출 및 스폰서 매칭
  const handleSubmitAdvice = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newStory = {
      id: Date.now(),
      mentorName: selectedWorry?.preferredMentor || '따뜻한 어르신',
      mentorAudioText: '아가야, 기운 내거라. 이 국밥 든든하게 먹고 다시 일어서는 거다. 할매/할배가 응원한다.',
      youthName: selectedWorry?.youthName || '익명의 청년',
      sponsorName: '배달의민족 (우아한형제들)',
      foodPhoto: SAMPLE_FOOD_PHOTOS[0],
      letterContent: '어르신, 남겨주신 말씀 듣고 식당에서 펑펑 울었습니다. 따뜻한 국밥 잘 먹고 꼭 멋진 사람 되겠습니다!',
      date: '방금 전'
    };
    setStories([newStory, ...stories]);
    setWorries(worries.filter(w => w.id !== selectedWorry?.id));
    setSeniorStep('COMPLETED');
  };

  // 청년 고민 등록
  const handleYouthSubmit = (e) => {
    e.preventDefault();
    if (!youthTitle || !youthContent) {
      alert('제목과 고민 내용을 입력해 주세요.');
      return;
    }
    const newWorry = {
      id: Date.now(),
      category: youthCategory,
      youthName: '익명 청년 (' + (youthCategory.includes('취업') ? '취준생' : '청년') + ')',
      title: youthTitle,
      content: youthContent,
      preferredMentor: youthMentor,
      status: 'WAITING',
      date: '방금 전'
    };
    setWorries([newWorry, ...worries]);
    setYouthSubmitted(true);
  };

  // 청년 완식 인증 & 손편지 최종 전송 핸들러
  const handleThankYouSubmit = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    // 보람 피드와 명예의 전당에 새 감사 답장 등록
    const thankStory = {
      id: Date.now(),
      mentorName: INITIAL_INBOX_GIFT.mentorName.split(' ')[0] + ' ' + INITIAL_INBOX_GIFT.mentorName.split(' ')[1],
      mentorAudioText: INITIAL_INBOX_GIFT.mentorAudioText,
      youthName: '김민수 (26세 취준생)',
      sponsorName: INITIAL_INBOX_GIFT.sponsorName,
      foodPhoto: SAMPLE_FOOD_PHOTOS[thankPhotoIndex],
      letterContent: thankLetter,
      date: '방금 전 답장'
    };
    setStories([thankStory, ...stories]);

    alert('🎉 할머니께 감사 편지와 완식 인증샷이 성공적으로 배달되었습니다!\n어르신 모드의 [내 손주 소식함]과 [명예의 전당]에서 확인해 보세요.');
    setUserMode('SENIOR');
    setSeniorStep('MY_STORIES');
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-0 sm:py-6 text-slate-800">
      {/* 모바일 화면 래퍼 (390px ~ 430px 최적화) */}
      <div className="w-full sm:max-w-[430px] bg-white sm:rounded-3xl shadow-2xl flex flex-col min-h-screen sm:min-h-[850px] overflow-hidden border border-slate-200">
        
        {/* 상단 글로벌 모드 스위처 */}
        <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍚</span>
            <span className="font-extrabold tracking-tight text-amber-400 text-lg">할담소</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">완전체 v1.3</span>
          </div>

          <div className="flex bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button 
              onClick={() => { setUserMode('SENIOR'); setSeniorStep('FEED'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${userMode === 'SENIOR' ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              👵 어르신 모드
            </button>
            <button 
              onClick={() => setUserMode('YOUTH')}
              className={`px-3 py-1.5 rounded-lg transition-all relative ${userMode === 'YOUTH' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🧑 청년 모드
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setUserMode('HALL')}
              className={`px-2 py-1.5 rounded-lg transition-all ${userMode === 'HALL' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🏆 명예
            </button>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {/* 👵 [1] 어르신 전용 모드 (큰 글씨, 24pt~32pt, 초간편 원터치) */}
        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {userMode === 'SENIOR' && (
          <main className="flex-1 flex flex-col bg-amber-50/40">
            
            {/* 어르신 서브 헤더 */}
            <div className="bg-amber-100/90 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
              <span className="text-amber-950 font-bold text-lg flex items-center gap-1.5">
                <span>👵</span> 어르신 사랑방
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSeniorStep('FEED')}
                  className={`text-sm px-3 py-1.5 rounded-full font-bold border transition ${seniorStep === 'FEED' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-amber-900 border-amber-300'}`}
                >
                  청년 고민 ({worries.length})
                </button>
                <button 
                  onClick={() => setSeniorStep('MY_STORIES')}
                  className={`text-sm px-3 py-1.5 rounded-full font-bold border transition ${seniorStep === 'MY_STORIES' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-amber-900 border-amber-300'}`}
                >
                  손주 소식함 ({stories.length}) 💌
                </button>
              </div>
            </div>

            {/* 1-1. 어르신 피드 화면 (SCR-S01) */}
            {seniorStep === 'FEED' && (
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    어르신, 반갑습니다! 🌸
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 mt-1 font-medium">
                    오늘도 든든한 밥과 따뜻한 위로를 기다리는 청년들이 있습니다.
                  </p>
                  <div className="mt-3 bg-amber-50 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    어르신 비용 부담 0원! (기업 후원으로 밥값 전액 지원)
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {worries.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
                      <p className="text-4xl mb-3">🎉</p>
                      <p className="text-xl font-bold text-slate-800">모든 청년에게 밥과 지혜가 전달되었습니다!</p>
                      <p className="text-base text-slate-600 mt-1">새로운 고민이 등록되면 카카오톡으로 알려드릴게요.</p>
                    </div>
                  ) : (
                    worries.map((worry) => (
                      <div 
                        key={worry.id} 
                        className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md hover:border-amber-400 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-amber-100 text-amber-900 text-sm font-extrabold px-3 py-1 rounded-full border border-amber-300">
                            🍚 밥이 고픈 청년 ({worry.category})
                          </span>
                          <span className="text-xs text-slate-500 font-bold">{worry.date}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 leading-snug">
                          {worry.title}
                        </h3>

                        <p className="text-base sm:text-lg text-slate-700 mt-3 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
                          "{worry.content}"
                        </p>

                        <div className="mt-3 text-xs text-slate-500 font-bold flex justify-between items-center px-1">
                          <span>작성자: {worry.youthName}</span>
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">희망 어른: {worry.preferredMentor}</span>
                        </div>

                        {/* 음성으로 듣기 (TTS) 버튼 */}
                        <div className="mt-4 flex flex-col gap-2.5">
                          <button
                            onClick={() => speakText(`${worry.youthName} 청년의 고민입니다. ${worry.title}. ${worry.content}`)}
                            className="w-full h-13 rounded-2xl bg-amber-100 text-amber-950 hover:bg-amber-200 font-bold text-base flex items-center justify-center gap-2 border border-amber-300 active:scale-[0.98] transition"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-5 h-5 text-amber-800 animate-pulse" />
                                <span>낭독 멈추기</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-5 h-5 text-amber-800" />
                                <span>🔊 청년의 글 소리내어 듣기</span>
                              </>
                            )}
                          </button>

                          {/* 초대형 말씀 건네기 버튼 (높이 64px) */}
                          <button
                            onClick={() => {
                              setSelectedWorry(worry);
                              setSeniorStep('RECORDER');
                              if (isSpeaking) window.speechSynthesis.cancel();
                            }}
                            className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition"
                          >
                            <Mic className="w-7 h-7 text-slate-950" />
                            <span>🎙️ 이 청년에게 말씀 건네기</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 1-2. 원터치 육성 녹음기 화면 (SCR-S02) */}
            {seniorStep === 'RECORDER' && selectedWorry && (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      if (isRecording) stopRecording();
                      setSeniorStep('FEED');
                    }}
                    className="self-start text-sm font-bold text-slate-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
                  </button>

                  <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm">
                    <p className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      고민 청년: {selectedWorry.youthName}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                      "{selectedWorry.title}"
                    </p>
                  </div>

                  <div className="text-center my-3">
                    <p className="text-xl sm:text-2xl font-black text-slate-900">
                      손주에게 하듯 편하게 말씀해 주세요
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      마이크 버튼을 한 번 누르면 녹음이 시작됩니다 (최대 3분)
                    </p>
                  </div>
                </div>

                {/* 중앙 120px 초대형 원형 녹음 버튼 */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                        isRecording 
                          ? 'bg-rose-500 text-white recording-pulse-btn scale-105' 
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-12 h-12 fill-white text-white" />
                          <span className="text-xs font-bold mt-1">녹음 중단</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-14 h-14" />
                          <span className="text-sm font-extrabold mt-1">말씀 시작</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 시간 표시 */}
                  <div className="mt-5 text-center">
                    <p className={`text-3xl font-black tracking-wider ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                      {formatTime(recordSeconds)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {isRecording ? '어르신의 따뜻한 목소리를 담고 있습니다...' : (audioUrl ? '녹음이 완료되었습니다!' : '버튼을 눌러 녹음하세요')}
                    </p>
                  </div>

                  {/* 녹음 완료 후 다시 듣기 플레이어 */}
                  {audioUrl && !isRecording && (
                    <div className="mt-4 w-full bg-amber-100/80 p-3.5 rounded-2xl border border-amber-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (audioPlayerRef.current) {
                              if (isPlayingAudio) {
                                audioPlayerRef.current.pause();
                                setIsPlayingAudio(false);
                              } else {
                                audioPlayerRef.current.play();
                                setIsPlayingAudio(true);
                              }
                            } else {
                              alert('어르신의 음성이 선명하게 녹음되었습니다! (시뮬레이션 재생)');
                            }
                          }}
                          className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow"
                        >
                          {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">내 목소리 들어보기</p>
                          <p className="text-xs text-slate-600">녹음 시간: {formatTime(recordSeconds)}</p>
                        </div>
                      </div>
                      {audioUrl !== 'SIMULATED_AUDIO' && (
                        <audio 
                          ref={audioPlayerRef} 
                          src={audioUrl} 
                          onEnded={() => setIsPlayingAudio(false)} 
                          className="hidden" 
                        />
                      )}
                      <button 
                        onClick={startRecording}
                        className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> 다시 녹음
                      </button>
                    </div>
                  )}
                </div>

                {/* 하단 완료 및 제출 버튼 (높이 64px) */}
                <div className="flex flex-col gap-2">
                  <button
                    disabled={!audioUrl && !isRecording}
                    onClick={handleSubmitAdvice}
                    className={`w-full h-16 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-lg transition ${
                      audioUrl 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.98]' 
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>✅ 말씀 다했습니다! (전송하기)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1-3. 스폰서 매칭 완료 축하 화면 (SCR-S03) */}
            {seniorStep === 'COMPLETED' && (
              <div className="p-5 flex-1 flex flex-col justify-center items-center text-center bg-white">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mb-3 shadow-inner">
                  🌸
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  어르신, 참 잘하셨습니다!
                </h2>
                
                <p className="text-base sm:text-lg text-slate-700 mt-2 font-medium">
                  남겨주신 따뜻한 한마디가<br />
                  <strong className="text-amber-800 font-bold">민수 청년</strong>에게 다시 일어설 큰 용기가 됩니다.
                </p>

                {/* 스폰서 매칭 카드 */}
                <div className="mt-6 w-full bg-slate-50 border-2 border-amber-300 p-4 rounded-3xl text-left shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎁</span>
                    <span className="text-sm font-extrabold text-amber-900">할담소 세대 상생 파트너</span>
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    "배달의민족 (우아한형제들)"에서
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    어르신의 뜻을 받들어 청년에게 <strong className="text-emerald-700 font-extrabold">10,000원 국밥 식사권</strong>을 무료로 쏩니다!
                  </p>
                  <div className="mt-2 text-xs font-bold text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                    * 어르신 본인 부담금: 0원 (전액 스폰서 후원)
                  </div>
                </div>

                <div className="mt-6 w-full flex flex-col gap-2.5">
                  <button
                    onClick={() => setSeniorStep('MY_STORIES')}
                    className="w-full h-15 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow"
                  >
                    <span>내 손주 소식함 가기 💌</span>
                  </button>
                  <button
                    onClick={() => setSeniorStep('FEED')}
                    className="w-full h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base"
                  >
                    다른 청년 고민 더 둘러보기
                  </button>
                </div>
              </div>
            )}

            {/* 1-4. 어르신 보람 피드: 내 손주 소식함 (SCR-S04) */}
            {seniorStep === 'MY_STORIES' && (
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">💌 내 손주 소식함</h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">내가 살린 청년들의 식사 인증과 손편지</p>
                  </div>
                  <button 
                    onClick={() => setSeniorStep('FEED')}
                    className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300"
                  >
                    고민 피드로
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {stories.map((st) => (
                    <div key={st.id} className="bg-white rounded-3xl p-4 border-2 border-slate-300 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                          <span>🍲</span> {st.youthName} 청년의 답장
                        </span>
                        <span className="text-xs text-slate-500 font-bold">{st.date}</span>
                      </div>

                      {/* 완식 사진 */}
                      <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100">
                        <img 
                          src={st.foodPhoto} 
                          alt="식사 완식 인증" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                          ✨ 뚝배기 완식 완료
                        </div>
                      </div>

                      {/* 청년 손편지 */}
                      <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                        <p className="text-xs font-bold text-amber-900 mb-1">손주가 보낸 편지:</p>
                        <p className="text-base font-medium text-slate-800 leading-relaxed">
                          "{st.letterContent}"
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                        <span>후원: {st.sponsorName}</span>
                        <span className="text-emerald-700 font-bold">10,000원 식사 지원 완료</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {/* 🧑 [2] 청년 모드 (감성 딥네이비/오렌지, 선물함 & 완식 인증 & 고민등록) */}
        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {userMode === 'YOUTH' && (
          <main className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-y-auto">
            
            {/* 청년 모드 서브 탭 (선물 수신함 vs 고민 접수) */}
            <div className="bg-slate-950/70 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                <span>🌱</span> 청년 마음 쉼터
              </span>
              <div className="flex bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setYouthTab('INBOX')}
                  className={`px-3 py-1 rounded-lg transition relative ${youthTab === 'INBOX' || youthTab === 'THANK_YOU' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  도착한 선물 💌
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-[10px] rounded-full text-white font-bold">1</span>
                </button>
                <button
                  onClick={() => { setYouthTab('WRITE'); setYouthSubmitted(false); }}
                  className={`px-3 py-1 rounded-lg transition ${youthTab === 'WRITE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  고민 신청하기 ✍️
                </button>
              </div>
            </div>

            {/* 2-1. [SCR-Y03] 청년 선물 수신 뷰어 (LP판 감성 오디오 + 기프티콘) */}
            {youthTab === 'INBOX' && (
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="bg-gradient-to-r from-amber-500/20 to-indigo-500/20 p-4 rounded-3xl border border-amber-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> 밥과 말씀 도착!
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">{INITIAL_INBOX_GIFT.receivedAt}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">
                    {INITIAL_INBOX_GIFT.mentorName}의 따뜻한 국밥과 조언이 도착했습니다!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    "아가야, 굶지 말고 이 국밥 든든하게 먹고 다시 일어서자."
                  </p>
                </div>

                {/* 📀 LP판 감성 오디오 플레이어 카드 */}
                <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl shadow-xl flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className={`w-24 h-24 rounded-full bg-slate-950 border-4 border-amber-500/40 flex items-center justify-center shadow-2xl transition-all ${isPlayingMentorVoice ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 text-xs font-black">
                        LP
                      </div>
                    </div>
                    {isPlayingMentorVoice && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-extrabold text-amber-300">
                    👵 {INITIAL_INBOX_GIFT.mentorName}의 육성 조언
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    잔잔한 피아노 선율과 함께 어르신의 따뜻한 목소리가 재생됩니다.
                  </p>

                  <div className="mt-4 w-full bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 text-left">
                    <p className="text-xs text-slate-400 font-bold mb-1">💌 어르신의 말씀 미리보기:</p>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{INITIAL_INBOX_GIFT.mentorAudioText}"
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isPlayingMentorVoice) {
                        window.speechSynthesis.cancel();
                        setIsPlayingMentorVoice(false);
                      } else {
                        speakText(INITIAL_INBOX_GIFT.mentorAudioText, 0.85);
                        setIsPlayingMentorVoice(true);
                      }
                    }}
                    className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
                  >
                    {isPlayingMentorVoice ? (
                      <>
                        <Pause className="w-4 h-4 fill-slate-950" />
                        <span>할머니 목소리 멈추기</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>▶ 할머니 육성 조언 듣기 (01:24)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 🍲 모바일 식사 기프티콘 바코드 카드 */}
                <div className="bg-white text-slate-950 p-5 rounded-3xl shadow-xl border-2 border-amber-400 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        전국 매장 / 배달의민족 사용 가능
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {INITIAL_INBOX_GIFT.gifticonName}
                      </h4>
                    </div>
                    <span className="text-lg">🍲</span>
                  </div>

                  {/* 리얼한 바코드 그래픽 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
                    <div className="flex items-center gap-[3px] h-14 w-full max-w-[260px] justify-center px-2 bg-white rounded-lg border border-slate-300 py-1">
                      {/* CSS 가상 바코드 패턴 */}
                      {[2,4,1,3,2,1,5,2,3,1,4,2,1,3,2,4,1,2,5,1,3,2,4,1,2,3,1,4,2].map((w, i) => (
                        <div key={i} className="bg-slate-950 h-full rounded-[1px]" style={{ width: `${w * 2.2}px` }}></div>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-xs font-black tracking-widest text-slate-700">
                      {INITIAL_INBOX_GIFT.gifticonBarcode}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between items-center px-1">
                    <span>후원: {INITIAL_INBOX_GIFT.sponsorName}</span>
                    <span className="font-bold text-amber-700">유효기간: 93일 남음</span>
                  </div>

                  {/* 완식 인증 및 감사 편지 쓰기로 연결되는 황금 버튼 */}
                  <button
                    onClick={() => setYouthTab('THANK_YOU')}
                    className="mt-1 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition"
                  >
                    <Utensils className="w-5 h-5" />
                    <span>🍚 국밥 먹고 완식 인증 & 손편지 쓰기</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2-2. [SCR-Y04] 뚝배기 완식 인증샷 & 감사 손편지 작성 화면 */}
            {youthTab === 'THANK_YOU' && (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setYouthTab('INBOX')}
                    className="self-start text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> 기프티콘 화면으로
                  </button>

                  <div>
                    <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                      감사 답장 쓰기
                    </span>
                    <h3 className="text-xl font-black text-white mt-1.5">
                      할머니 덕분에 따뜻한 한 끼를 먹었습니다
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      빈 뚝배기 사진과 진심 어린 편지를 남기면 할머니의 [손주 소식함]으로 즉시 전달됩니다.
                    </p>
                  </div>

                  {/* 1. 완식 인증 사진 선택 (시뮬레이터) */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2">
                    <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4" /> 1. 국밥 한 그릇 뚝딱 비운 사진 (완식 필수)
                      </span>
                      <span className="text-[10px] text-slate-400">사진 클릭 시 변경 가능</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {SAMPLE_FOOD_PHOTOS.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setThankPhotoIndex(idx)}
                          className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition ${thankPhotoIndex === idx ? 'border-amber-400 scale-[1.03] shadow-md' : 'border-slate-700 opacity-60'}`}
                        >
                          <img src={photo} alt="완식 샘플" className="w-full h-full object-cover" />
                          {thankPhotoIndex === idx && (
                            <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. 할머니께 드리는 손편지 작성 */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2">
                    <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" /> 2. 할머니께 전하는 손편지 (50자 이상)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{thankLetter.length}자</span>
                    </label>
                    <textarea
                      rows={5}
                      value={thankLetter}
                      onChange={(e) => setThankLetter(e.target.value)}
                      placeholder="어르신의 조언을 듣고 느낀 감동과 감사의 마음을 편하게 남겨주세요."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>할담소 명예의 전당 전광판에 함께 등록됩니다.</span>
                  </div>
                </div>

                {/* 최종 전송 버튼 */}
                <button
                  onClick={handleThankYouSubmit}
                  className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition"
                >
                  <Send className="w-5 h-5" />
                  <span>💌 할머니께 눈물의 감사 편지 보내기</span>
                </button>
              </div>
            )}

            {/* 2-3. [SCR-Y01] 청년 고민 작성 폼 */}
            {youthTab === 'WRITE' && (
              <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                {youthSubmitted ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl mb-3 border border-indigo-500/40">
                      🍚
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      고민이 안전하게 접수되었습니다
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      인생 선배 할머니, 할아버지께서<br />
                      따뜻한 말씀과 든든한 국밥을 준비하고 계십니다.<br />
                      답변이 도착하면 카카오톡으로 안내해 드릴게요.
                    </p>

                    <div className="mt-6 w-full bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left">
                      <p className="text-xs text-indigo-400 font-bold">선택하신 어른</p>
                      <p className="text-base font-bold text-white mt-0.5">{youthMentor}</p>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        * 어르신의 육성 조언과 함께 10,000원 식사 기프티콘이 무료로 발송됩니다.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 w-full">
                      <button
                        onClick={() => {
                          setUserMode('SENIOR');
                          setSeniorStep('FEED');
                        }}
                        className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow"
                      >
                        어르신 사랑방으로 가서 내 고민 확인해보기 👵
                      </button>
                      <button
                        onClick={() => setYouthTab('INBOX')}
                        className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        도착한 선물함 구경하기
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleYouthSubmit} className="flex flex-col gap-3.5">
                    <div>
                      <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                        청년 100% 무료 힐링 상담
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2">
                        힘든 오늘, 밥은 먹었니?
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        인생의 산전수전을 겪은 어르신들이 따뜻한 조언과 국밥을 쏩니다.
                      </p>
                    </div>

                    {/* 카테고리 선택 */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        1. 어떤 고민인가요?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['취업/진로', '연애/이별', '번아웃/우울', '가족/관계'].map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setYouthCategory(cat)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                              youthCategory === cat
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 멘토 성향 선택 */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        2. 원하는 어른의 성향
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: '옥분 할머니', desc: '따뜻한 위로와 토닥임' },
                          { name: '순자 할머니', desc: '츤데레 팩폭과 용기' },
                          { name: '덕배 할아버지', desc: '산전수전 돌파의 지혜' },
                          { name: '종석 할아버지', desc: '다정한 낭만 조언' }
                        ].map((m) => (
                          <button
                            type="button"
                            key={m.name}
                            onClick={() => setYouthMentor(m.name)}
                            className={`p-2.5 rounded-xl text-left border transition ${
                              youthMentor === m.name
                                ? 'bg-indigo-600/30 border-indigo-400 text-white'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <p className="text-xs font-bold">{m.name}</p>
                            <p className="text-[10px] text-slate-400">{m.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 제목 및 본문 입력 */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        3. 고민 털어놓기
                      </label>
                      <input
                        type="text"
                        placeholder="제목 (예: 서류 30번째 탈락, 너무 막막합니다)"
                        value={youthTitle}
                        onChange={(e) => setYouthTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-2"
                      />
                      <textarea
                        rows={4}
                        placeholder="부모님이나 친구에겐 차마 말하지 못했던 솔직한 마음을 적어주세요. 인생 선배가 귀담아 듣고 국밥을 보냅니다."
                        value={youthContent}
                        onChange={(e) => setYouthContent(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 active:scale-[0.98] transition"
                    >
                      🍲 밥 한 끼와 말씀 신청하기 (무료 0원)
                    </button>
                  </form>
                )}
              </div>
            )}
          </main>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {/* 🏆 [3] 명예의 전당 (실시간 감동 완식 전광판) */}
        {/* ════════════════════════════════════════════════════════════════════════════ */}
        {userMode === 'HALL' && (
          <main className="flex-1 flex flex-col bg-slate-950 text-white p-4 overflow-y-auto">
            <div className="text-center py-4 border-b border-slate-800">
              <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full font-bold">
                실시간 세대 상생 전광판
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                할담소 명예의 전당 🏆
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                어르신의 지혜와 기업의 후원으로 청년이 다시 일어섭니다.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {stories.map((st) => (
                <div key={st.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                      {st.mentorName} 멘토
                    </span>
                    <span className="text-xs text-slate-500">{st.date}</span>
                  </div>

                  {/* 어르신의 한마디 */}
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">👵 어르신의 말씀</p>
                    <p className="text-sm font-semibold text-amber-200">
                      "{st.mentorAudioText}"
                    </p>
                  </div>

                  {/* 완식 사진 */}
                  <div className="relative rounded-xl overflow-hidden h-40 bg-slate-800">
                    <img src={st.foodPhoto} alt="완식 인증" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      {st.youthName} 청년 완식
                    </div>
                  </div>

                  {/* 손편지 */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    "{st.letterContent}"
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>후원: {st.sponsorName}</span>
                    <span className="text-rose-400 flex items-center gap-1 font-bold">
                      <Heart className="w-3 h-3 fill-rose-400" /> 감동 응원 248명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

      </div>
    </div>
  );
}
