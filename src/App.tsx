import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { ActiveGameArena } from './components/ActiveGameArena';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { CalibrationModal } from './components/CalibrationModal';
import { Question, BubbleState, GameSettings, UserStats } from './types';
import { ALL_QUESTIONS } from './data/questions';
import { sound } from './utils/audio';

const LETTERS = ['A', 'B', 'C', 'D'];
const COLORS: Array<'rose' | 'cyan' | 'amber' | 'emerald'> = ['rose', 'cyan', 'amber', 'emerald'];

export default function App() {
  // Game Flow State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const maxTime = 20;

  // Answer tracking
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [questionHistory, setQuestionHistory] = useState<Array<{ question: Question; userChoiceIndex: number; isCorrect: boolean }>>([]);

  // Stats
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    timeBonusTotal: 0
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    motionSensitivity: 28,
    holdTimeToPop: 1.1,
    soundEnabled: true,
    mirrorCamera: true,
    showMotionHeatmap: false,
    bubbleFloatSpeed: 'normal'
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  // Camera & Motion Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);

  // Floating Bubble state positions & charges
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);

  // Sound sync
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Initial questions selection helper
  const prepareQuestions = useCallback((catId: string) => {
    let pool = ALL_QUESTIONS;
    if (catId !== 'all') {
      pool = ALL_QUESTIONS.filter(q => q.category === catId);
    }
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  // Initialize Bubbles for a question
  const initializeBubblesForQuestion = useCallback((q: Question) => {
    // 4 Spatial Bubble Positions well-spread across outer corners (leaving center open for user body)
    const positions = [
      { x: 18, y: 25, anim: 'animate-float-1' }, // Top-Left (A)
      { x: 82, y: 25, anim: 'animate-float-2' }, // Top-Right (B)
      { x: 18, y: 75, anim: 'animate-float-3' }, // Bottom-Left (C)
      { x: 82, y: 75, anim: 'animate-float-4' }  // Bottom-Right (D)
    ];

    const initialBubbles: BubbleState[] = q.options.map((optionText, idx) => ({
      id: idx,
      letter: LETTERS[idx],
      text: optionText,
      color: COLORS[idx],
      xPercent: positions[idx].x,
      yPercent: positions[idx].y,
      radiusPercent: 16,
      fillProgress: 0,
      motionIntensity: 0,
      isHovered: false,
      isPopped: false,
      floatDelay: `${idx * 0.4}s`,
      animClass: positions[idx].anim
    }));

    setBubbles(initialBubbles);
  }, []);

  // Request & Start Camera
  const startCamera = useCallback(async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false
      });
      mediaStreamRef.current = stream;
      setIsCamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Video play catch:', e));
      }
      return true;
    } catch (err) {
      console.warn('Camera permission not granted or unavailable:', err);
      setIsCamActive(false);
      return false;
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCamActive(false);
  }, []);

  // Ensure mounted video element always has active stream
  useEffect(() => {
    if (isCamActive && mediaStreamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        videoRef.current.play().catch(e => console.log('Video play err:', e));
      }
    }
  }, [gameState, isCamActive]);

  // Start game with camera
  const handleStartWithCamera = async () => {
    await startCamera();
    startGameplay();
  };

  // Start manual game without camera
  const handleStartManual = () => {
    stopCamera();
    startGameplay();
  };

  // Launch the actual game rounds
  const startGameplay = () => {
    const qList = prepareQuestions(selectedCategory);
    setActiveQuestions(qList);
    setCurrentIndex(0);
    setStats({
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      totalAnswered: 0,
      timeBonusTotal: 0
    });
    setQuestionHistory([]);
    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setTimeLeft(maxTime);
    initializeBubblesForQuestion(qList[0]);
    setGameState('playing');
  };

  // Selection Handler (by touch, click, or motion completion)
  const handleSelectOption = useCallback((optionIndex: number) => {
    if (isAnswered || gameState !== 'playing') return;

    setIsAnswered(true);
    setSelectedAnswerIndex(optionIndex);

    // Instant physical POP sound
    sound.playPop();

    const currentQ = activeQuestions[currentIndex];
    const isCorrect = (optionIndex === currentQ.correctIndex);

    // Update Bubble states: trigger instant pop explosion on selected bubble
    setBubbles(prev =>
      prev.map((b, idx) => {
        if (idx === optionIndex) {
          return { ...b, isPopped: true, fillProgress: 1 };
        }
        return b;
      })
    );

    // Coordinate particle explosion from the specific bubble location
    const targetBubble = bubbles[optionIndex];
    if (targetBubble) {
      confetti({
        particleCount: isCorrect ? 65 : 35,
        spread: 80,
        startVelocity: 30,
        origin: {
          x: targetBubble.xPercent / 100,
          y: targetBubble.yPercent / 100
        },
        colors: isCorrect
          ? ['#10b981', '#34d399', '#ffffff', '#fbbf24', '#06b6d4']
          : ['#f43f5e', '#fb7185', '#ffffff', '#fda4af']
      });
    }

    // Update Stats & Additional Feedback Sounds
    if (isCorrect) {
      const timeBonus = timeLeft * 10;
      const streakBonus = stats.streak * 25;
      const pointsEarned = 100 + timeBonus + streakBonus;

      setTimeout(() => sound.playCorrect(), 120);

      setStats(prev => {
        const nextStreak = prev.streak + 1;
        return {
          ...prev,
          score: prev.score + pointsEarned,
          streak: nextStreak,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          correctCount: prev.correctCount + 1,
          totalAnswered: prev.totalAnswered + 1,
          timeBonusTotal: prev.timeBonusTotal + timeBonus
        };
      });
    } else {
      setTimeout(() => sound.playWrong(), 120);
      setStats(prev => ({
        ...prev,
        streak: 0,
        totalAnswered: prev.totalAnswered + 1
      }));
    }

    // Record question history
    setQuestionHistory(prev => [
      ...prev,
      {
        question: currentQ,
        userChoiceIndex: optionIndex,
        isCorrect
      }
    ]);

    // Delay for feedback before advancing
    setTimeout(() => {
      if (currentIndex + 1 < activeQuestions.length) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setIsAnswered(false);
        setSelectedAnswerIndex(null);
        setTimeLeft(maxTime);
        initializeBubblesForQuestion(activeQuestions[nextIdx]);
      } else {
        // End of Trivia game
        setGameState('gameover');
        sound.playStreakBonus();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.45 }
        });
      }
    }, 2400);
  }, [isAnswered, gameState, activeQuestions, currentIndex, timeLeft, stats.streak, initializeBubblesForQuestion]);

  // Question Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelectOption(-1); // Timeout
          return 0;
        }
        if (prev <= 4) {
          sound.playTimerWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isAnswered, handleSelectOption]);

  // Motion Detection Computer Vision Loop
  useEffect(() => {
    if (gameState !== 'playing' || !isCamActive || isAnswered) return;

    let animId: number;

    const processMotion = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.save();
          if (settings.mirrorCamera) {
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();

          const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

          if (prevFrameRef.current) {
            const w = canvas.width;
            const h = canvas.height;
            const lastFrame = prevFrameRef.current;

            setBubbles(prevBubbles => {
              return prevBubbles.map((bubble, bIdx) => {
                if (bubble.isPopped) return bubble;

                // Define separated quadrants around each corner bubble
                // Bubble 0: Top-Left (0..w*0.42, 0..h*0.46)
                // Bubble 1: Top-Right (w*0.58..w, 0..h*0.46)
                // Bubble 2: Bottom-Left (0..w*0.42, h*0.54..h)
                // Bubble 3: Bottom-Right (w*0.58..w, h*0.54..h)
                const minX = bIdx % 2 === 0 ? 0 : Math.floor(w * 0.58);
                const maxX = bIdx % 2 === 0 ? Math.floor(w * 0.42) : w;
                const minY = bIdx < 2 ? 0 : Math.floor(h * 0.54);
                const maxY = bIdx < 2 ? Math.floor(h * 0.46) : h;

                let diffPixels = 0;
                const totalInZone = Math.max(1, (maxX - minX) * (maxY - minY));

                for (let y = minY; y < maxY; y += 2) {
                  for (let x = minX; x < maxX; x += 2) {
                    const idx = (y * w + x) * 4;
                    const rD = Math.abs(currentFrame.data[idx] - lastFrame.data[idx]);
                    const gD = Math.abs(currentFrame.data[idx + 1] - lastFrame.data[idx + 1]);
                    const bD = Math.abs(currentFrame.data[idx + 2] - lastFrame.data[idx + 2]);

                    if (rD + gD + bD > settings.motionSensitivity) {
                      diffPixels++;
                    }
                  }
                }

                const motionRatio = (diffPixels / (totalInZone / 4)) * 100;
                let nextProgress = bubble.fillProgress;
                const isHovering = motionRatio > 10;

                if (isHovering) {
                  // Increment progress based on hold time requirement
                  nextProgress += (0.065 / Math.max(0.4, settings.holdTimeToPop));
                  sound.playChargeTick(nextProgress);

                  if (nextProgress >= 1 && !isAnswered) {
                    // Trigger motion selection
                    setTimeout(() => {
                      handleSelectOption(bIdx);
                    }, 5);
                    return {
                      ...bubble,
                      fillProgress: 1,
                      motionIntensity: motionRatio,
                      isHovered: true
                    };
                  }
                } else {
                  // Decay smoothly when hand moves away
                  nextProgress = Math.max(0, nextProgress - 0.09);
                }

                return {
                  ...bubble,
                  fillProgress: Math.min(1, nextProgress),
                  motionIntensity: Math.round(motionRatio),
                  isHovered: isHovering
                };
              });
            });
          }

          prevFrameRef.current = currentFrame;
        }
      }

      animId = requestAnimationFrame(processMotion);
    };

    animId = requestAnimationFrame(processMotion);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, isCamActive, isAnswered, settings.mirrorCamera, settings.motionSensitivity, settings.holdTimeToPop, handleSelectOption]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        stats={stats}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        isCamActive={isCamActive}
      />

      {/* Main Game Stage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center">
        
        {/* START SCREEN */}
        {gameState === 'start' && (
          <StartScreen
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onStartWithCamera={handleStartWithCamera}
            onStartManual={handleStartManual}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            isCameraSupported={typeof navigator !== 'undefined' && !!navigator.mediaDevices}
            isCamActive={isCamActive}
          />
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === 'playing' && activeQuestions.length > 0 && (
          <ActiveGameArena
            currentQuestion={activeQuestions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            timeLeft={timeLeft}
            maxTime={maxTime}
            bubbles={bubbles}
            selectedAnswerIndex={selectedAnswerIndex}
            isAnswered={isAnswered}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCamActive={isCamActive}
            settings={settings}
            onToggleCamera={async () => {
              if (isCamActive) {
                stopCamera();
              } else {
                await startCamera();
              }
            }}
            onToggleMirror={() => setSettings(s => ({ ...s, mirrorCamera: !s.mirrorCamera }))}
            onSelectOption={handleSelectOption}
          />
        )}

        {/* GAME OVER & PODIUM SCREEN */}
        {gameState === 'gameover' && (
          <GameOverModal
            stats={stats}
            totalQuestions={activeQuestions.length}
            questionHistory={questionHistory}
            onRestart={startGameplay}
            onGoHome={() => setGameState('start')}
          />
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings(s => ({ ...s, ...newVals }))}
      />

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        videoRef={videoRef}
        motionSensitivity={settings.motionSensitivity}
        holdTimeToPop={settings.holdTimeToPop}
        mirrorCamera={settings.mirrorCamera}
      />

      {/* Hidden fallback video element if not mounted in game arena yet */}
      <video
        ref={gameState !== 'playing' ? videoRef : undefined}
        className="hidden"
        playsInline
        autoPlay
        muted
      />

    </div>
  );
}
