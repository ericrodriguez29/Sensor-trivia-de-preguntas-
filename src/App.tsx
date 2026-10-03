import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { ActiveGameArena } from './components/ActiveGameArena';
import { SplitScreenVersusArena } from './components/SplitScreenVersusArena';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { CalibrationModal } from './components/CalibrationModal';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { MultiplayerPodiumModal } from './components/MultiplayerPodiumModal';
import { Question, BubbleState, GameSettings, UserStats, GameMode, OnlineRoomState, VersusPlayerState } from './types';
import { ALL_QUESTIONS } from './data/questions';
import { sound } from './utils/audio';
import { mpSocket } from './utils/multiplayerSocket';

const LETTERS = ['A', 'B', 'C', 'D'];
const COLORS: Array<'rose' | 'cyan' | 'amber' | 'emerald'> = ['rose', 'cyan', 'amber', 'emerald'];

export default function App() {
  // Game Flow State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const maxTime = 20;

  // Answer tracking
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [roundWinnerPlayerId, setRoundWinnerPlayerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [questionHistory, setQuestionHistory] = useState<Array<{ question: Question; userChoiceIndex: number; isCorrect: boolean }>>([]);
  const [roundWinnerMessage, setRoundWinnerMessage] = useState<string | null>(null);

  // Solo Stats
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    timeBonusTotal: 0
  });

  // Local Versus State
  const [versusPlayers, setVersusPlayers] = useState<[VersusPlayerState, VersusPlayerState]>([
    { id: 'p1', name: 'Jugador 1 (Azul)', color: '#06b6d4', avatar: '🔵', score: 0, streak: 0, lastAnswerIndex: null, hasAnswered: false },
    { id: 'p2', name: 'Jugador 2 (Rojo)', color: '#f43f5e', avatar: '🔴', score: 0, streak: 0, lastAnswerIndex: null, hasAnswered: false }
  ]);

  // Online Multiplayer State
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomState | null>(null);
  const [myPlayerId] = useState<string>(() => 'player_' + Math.random().toString(36).substring(2, 9));
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    motionSensitivity: 28,
    holdTimeToPop: 0.9,
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

  // Floating Bubble states (Standard for Solo/Online, and Split Screen for Local Versus)
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);
  const [p1Bubbles, setP1Bubbles] = useState<BubbleState[]>([]);
  const [p2Bubbles, setP2Bubbles] = useState<BubbleState[]>([]);

  // Sound sync
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Initial questions selection helper
  const prepareQuestions = useCallback((catId: string, seed?: number) => {
    let pool = ALL_QUESTIONS;
    if (catId !== 'all') {
      pool = ALL_QUESTIONS.filter(q => q.category === catId);
    }
    let shuffled = [...pool];
    if (seed) {
      const seededRand = (s: number) => {
        const x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
      };
      let s = seed;
      shuffled = shuffled.sort(() => seededRand(s++) - 0.5);
    } else {
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    }
    return shuffled.slice(0, 10);
  }, []);

  // Initialize Bubbles for Solo / Online
  const initializeBubblesForQuestion = useCallback((q: Question) => {
    const positions = [
      { x: 18, y: 25, anim: 'animate-float-1' },
      { x: 82, y: 25, anim: 'animate-float-2' },
      { x: 18, y: 75, anim: 'animate-float-3' },
      { x: 82, y: 75, anim: 'animate-float-4' }
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

  // Initialize Bubbles for Split Screen Local Versus (Separate Left & Right Viewports)
  const initializeVersusBubblesForQuestion = useCallback((q: Question) => {
    const p1Positions = [
      { x: 26, y: 30, anim: 'animate-float-1' },
      { x: 74, y: 30, anim: 'animate-float-2' },
      { x: 26, y: 74, anim: 'animate-float-3' },
      { x: 74, y: 74, anim: 'animate-float-4' }
    ];

    const p2Positions = [
      { x: 26, y: 30, anim: 'animate-float-2' },
      { x: 74, y: 30, anim: 'animate-float-1' },
      { x: 26, y: 74, anim: 'animate-float-4' },
      { x: 74, y: 74, anim: 'animate-float-3' }
    ];

    const b1: BubbleState[] = q.options.map((optionText, idx) => ({
      id: idx,
      letter: LETTERS[idx],
      text: optionText,
      color: COLORS[idx],
      xPercent: p1Positions[idx].x,
      yPercent: p1Positions[idx].y,
      radiusPercent: 20,
      fillProgress: 0,
      motionIntensity: 0,
      isHovered: false,
      isPopped: false,
      floatDelay: `${idx * 0.3}s`,
      animClass: p1Positions[idx].anim
    }));

    const b2: BubbleState[] = q.options.map((optionText, idx) => ({
      id: idx,
      letter: LETTERS[idx],
      text: optionText,
      color: COLORS[idx],
      xPercent: p2Positions[idx].x,
      yPercent: p2Positions[idx].y,
      radiusPercent: 20,
      fillProgress: 0,
      motionIntensity: 0,
      isHovered: false,
      isPopped: false,
      floatDelay: `${idx * 0.3}s`,
      animClass: p2Positions[idx].anim
    }));

    setP1Bubbles(b1);
    setP2Bubbles(b2);
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

  // Start Solo game with camera
  const handleStartWithCamera = async () => {
    setGameMode('solo');
    await startCamera();
    startGameplay();
  };

  // Start manual game without camera
  const handleStartManual = () => {
    setGameMode('solo');
    stopCamera();
    startGameplay();
  };

  // Launch Solo game rounds
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
    setRoundWinnerMessage(null);
    setRoundWinnerPlayerId(null);
    setTimeLeft(maxTime);
    initializeBubblesForQuestion(qList[0]);
    setGameState('playing');
  };

  // Start Local 1 vs 1 Split Screen Versus
  const handleStartLocalVersus = async (p1Name: string, p2Name: string) => {
    setGameMode('local_versus');
    setVersusPlayers([
      { id: 'p1', name: p1Name || 'Jugador 1 (Azul)', color: '#06b6d4', avatar: '🔵', score: 0, streak: 0, lastAnswerIndex: null, hasAnswered: false },
      { id: 'p2', name: p2Name || 'Jugador 2 (Rojo)', color: '#f43f5e', avatar: '🔴', score: 0, streak: 0, lastAnswerIndex: null, hasAnswered: false }
    ]);
    setIsMultiplayerModalOpen(false);
    await startCamera();
    const qList = prepareQuestions(selectedCategory);
    setActiveQuestions(qList);
    setCurrentIndex(0);
    setIsAnswered(false);
    setSelectedAnswerIndex(null);
    setRoundWinnerMessage(null);
    setRoundWinnerPlayerId(null);
    setTimeLeft(maxTime);
    initializeVersusBubblesForQuestion(qList[0]);
    setGameState('playing');
  };

  // Online Multiplayer WebSocket Listeners
  useEffect(() => {
    const unsubscribe = mpSocket.subscribe((msg) => {
      if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_UPDATED') {
        if (msg.room) {
          setOnlineRoom(msg.room as OnlineRoomState);
        }
      } else if (msg.type === 'GAME_STARTED') {
        if (msg.room) {
          setOnlineRoom(msg.room as OnlineRoomState);
          setGameMode('online_multiplayer');
          setIsMultiplayerModalOpen(false);
          const qList = prepareQuestions((msg.room as OnlineRoomState).category, msg.questionSeed as number);
          setActiveQuestions(qList);
          setCurrentIndex(0);
          setIsAnswered(false);
          setSelectedAnswerIndex(null);
          setRoundWinnerMessage(null);
          setRoundWinnerPlayerId(null);
          setTimeLeft(maxTime);
          initializeBubblesForQuestion(qList[0]);
          startCamera();
          setGameState('playing');
        }
      } else if (msg.type === 'PLAYER_ANSWERED') {
        if (msg.room) {
          setOnlineRoom(msg.room as OnlineRoomState);
        }
      } else if (msg.type === 'NEXT_QUESTION_SYNC') {
        if (msg.room) {
          setOnlineRoom(msg.room as OnlineRoomState);
          const nextIdx = msg.questionIndex as number;
          setCurrentIndex(nextIdx);
          setIsAnswered(false);
          setSelectedAnswerIndex(null);
          setRoundWinnerMessage(null);
          setRoundWinnerPlayerId(null);
          setTimeLeft(maxTime);
          if (activeQuestions[nextIdx]) {
            initializeBubblesForQuestion(activeQuestions[nextIdx]);
          }
        }
      } else if (msg.type === 'GAME_OVER') {
        if (msg.room) {
          setOnlineRoom(msg.room as OnlineRoomState);
        }
        setGameState('gameover');
        sound.playStreakBonus();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.45 } });
      }
    });

    return () => unsubscribe();
  }, [activeQuestions, initializeBubblesForQuestion, prepareQuestions, startCamera]);

  // Create Online Room
  const handleCreateOnlineRoom = async (name: string, avatar: string, category: string) => {
    setIsConnecting(true);
    await mpSocket.connect();
    mpSocket.send('CREATE_ROOM', { name, avatar, category, playerId: myPlayerId });
    setIsConnecting(false);
  };

  // Join Online Room
  const handleJoinOnlineRoom = async (roomCode: string, name: string, avatar: string) => {
    setIsConnecting(true);
    await mpSocket.connect();
    mpSocket.send('JOIN_ROOM', { roomCode, name, avatar, playerId: myPlayerId });
    setIsConnecting(false);
  };

  // Host starts online game
  const handleStartOnlineGame = () => {
    mpSocket.send('START_GAME', { questionSeed: Date.now() });
  };

  // Update room category
  const handleUpdateCategory = (category: string) => {
    mpSocket.send('UPDATE_CATEGORY', { category });
  };

  // Answer Selection Handler (Unified for Solo, Local Split-Screen Versus, and Online)
  const handleSelectOption = useCallback((optionIndex: number, playerSide?: 'p1' | 'p2') => {
    if (isAnswered || gameState !== 'playing') return;

    setIsAnswered(true);
    setSelectedAnswerIndex(optionIndex);

    // Instant physical POP sound
    sound.playPop();

    const currentQ = activeQuestions[currentIndex];
    const isCorrect = (optionIndex === currentQ.correctIndex);

    // Update Bubble states: trigger instant pop explosion on selected bubble
    if (gameMode === 'local_versus') {
      if (playerSide === 'p1') {
        setP1Bubbles(prev => prev.map((b, idx) => idx === optionIndex ? { ...b, isPopped: true, fillProgress: 1 } : b));
      } else {
        setP2Bubbles(prev => prev.map((b, idx) => idx === optionIndex ? { ...b, isPopped: true, fillProgress: 1 } : b));
      }
    } else {
      setBubbles(prev => prev.map((b, idx) => idx === optionIndex ? { ...b, isPopped: true, fillProgress: 1 } : b));
    }

    // Coordinate particle explosion from the specific bubble location
    const originX = gameMode === 'local_versus' ? (playerSide === 'p1' ? 0.25 : 0.75) : 0.5;
    confetti({
      particleCount: isCorrect ? 70 : 35,
      spread: 80,
      startVelocity: 30,
      origin: { x: originX, y: 0.5 },
      colors: isCorrect
        ? (playerSide === 'p1' ? ['#06b6d4', '#38bdf8', '#ffffff', '#10b981'] : ['#f43f5e', '#fb7185', '#ffffff', '#10b981'])
        : ['#94a3b8', '#64748b', '#ffffff']
    });

    const timeBonus = timeLeft * 10;
    const pointsEarned = 100 + timeBonus;

    // Mode-specific scoring
    if (gameMode === 'solo') {
      if (isCorrect) {
        const streakBonus = stats.streak * 25;
        const totalPoints = pointsEarned + streakBonus;
        setTimeout(() => sound.playCorrect(), 120);

        setStats(prev => {
          const nextStreak = prev.streak + 1;
          return {
            ...prev,
            score: prev.score + totalPoints,
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

      setQuestionHistory(prev => [
        ...prev,
        { question: currentQ, userChoiceIndex: optionIndex, isCorrect }
      ]);
    } else if (gameMode === 'local_versus') {
      const winningSide = playerSide || (optionIndex % 2 === 0 ? 'p1' : 'p2');
      if (isCorrect) {
        setTimeout(() => sound.playCorrect(), 120);
        setRoundWinnerPlayerId(winningSide);
        setVersusPlayers(prev => {
          const [p1, p2] = prev;
          if (winningSide === 'p1') {
            setRoundWinnerMessage(`¡Punto para ${p1.name}! (+${pointsEarned} pts)`);
            return [
              { ...p1, score: p1.score + pointsEarned, streak: p1.streak + 1 },
              { ...p2, streak: 0 }
            ];
          } else {
            setRoundWinnerMessage(`¡Punto para ${p2.name}! (+${pointsEarned} pts)`);
            return [
              { ...p1, streak: 0 },
              { ...p2, score: p2.score + pointsEarned, streak: p2.streak + 1 }
            ];
          }
        });
      } else {
        setTimeout(() => sound.playWrong(), 120);
        setRoundWinnerPlayerId(null);
        setRoundWinnerMessage('¡Ninguno acertó en esta ronda!');
      }
    } else if (gameMode === 'online_multiplayer') {
      mpSocket.send('SUBMIT_ANSWER', {
        optionIndex,
        isCorrect,
        pointsEarned: isCorrect ? pointsEarned : 0
      });
      if (isCorrect) {
        setTimeout(() => sound.playCorrect(), 120);
      } else {
        setTimeout(() => sound.playWrong(), 120);
      }
    }

    // Delay before advancing
    setTimeout(() => {
      if (gameMode === 'online_multiplayer') {
        if (onlineRoom?.hostId === myPlayerId) {
          mpSocket.send('NEXT_QUESTION', { totalQuestions: activeQuestions.length });
        }
      } else {
        if (currentIndex + 1 < activeQuestions.length) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          setIsAnswered(false);
          setSelectedAnswerIndex(null);
          setRoundWinnerMessage(null);
          setRoundWinnerPlayerId(null);
          setTimeLeft(maxTime);
          if (gameMode === 'local_versus') {
            initializeVersusBubblesForQuestion(activeQuestions[nextIdx]);
          } else {
            initializeBubblesForQuestion(activeQuestions[nextIdx]);
          }
        } else {
          setGameState('gameover');
          sound.playStreakBonus();
          confetti({ particleCount: 160, spread: 95, origin: { y: 0.45 } });
        }
      }
    }, 2400);
  }, [isAnswered, gameState, activeQuestions, currentIndex, timeLeft, gameMode, stats.streak, versusPlayers, onlineRoom?.hostId, myPlayerId, initializeBubblesForQuestion, initializeVersusBubblesForQuestion]);

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

  // Motion Detection Computer Vision Loop (Supports Solo, Online, and Split-Screen Dual Tracking)
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

            if (gameMode === 'local_versus') {
              // DUAL SPLIT-SCREEN COMPUTER VISION TRACKING
              // Track Player 1 on Left Half (x: 0..80)
              setP1Bubbles(prev => prev.map((bubble, bIdx) => {
                if (bubble.isPopped) return bubble;
                const minX = bIdx % 2 === 0 ? 0 : 40;
                const maxX = bIdx % 2 === 0 ? 40 : 80;
                const minY = bIdx < 2 ? 0 : 45;
                const maxY = bIdx < 2 ? 45 : 90;

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
                const isHovering = motionRatio > 11;

                if (isHovering) {
                  nextProgress += (0.075 / Math.max(0.4, settings.holdTimeToPop));
                  sound.playChargeTick(nextProgress);
                  if (nextProgress >= 1 && !isAnswered) {
                    setTimeout(() => handleSelectOption(bIdx, 'p1'), 5);
                    return { ...bubble, fillProgress: 1, motionIntensity: motionRatio, isHovered: true };
                  }
                } else {
                  nextProgress = Math.max(0, nextProgress - 0.09);
                }

                return { ...bubble, fillProgress: Math.min(1, nextProgress), motionIntensity: Math.round(motionRatio), isHovered: isHovering };
              }));

              // Track Player 2 on Right Half (x: 80..160)
              setP2Bubbles(prev => prev.map((bubble, bIdx) => {
                if (bubble.isPopped) return bubble;
                const minX = bIdx % 2 === 0 ? 80 : 120;
                const maxX = bIdx % 2 === 0 ? 120 : 160;
                const minY = bIdx < 2 ? 0 : 45;
                const maxY = bIdx < 2 ? 45 : 90;

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
                const isHovering = motionRatio > 11;

                if (isHovering) {
                  nextProgress += (0.075 / Math.max(0.4, settings.holdTimeToPop));
                  sound.playChargeTick(nextProgress);
                  if (nextProgress >= 1 && !isAnswered) {
                    setTimeout(() => handleSelectOption(bIdx, 'p2'), 5);
                    return { ...bubble, fillProgress: 1, motionIntensity: motionRatio, isHovered: true };
                  }
                } else {
                  nextProgress = Math.max(0, nextProgress - 0.09);
                }

                return { ...bubble, fillProgress: Math.min(1, nextProgress), motionIntensity: Math.round(motionRatio), isHovered: isHovering };
              }));
            } else {
              // Solo / Online standard 4-corner tracking
              setBubbles(prevBubbles => {
                return prevBubbles.map((bubble, bIdx) => {
                  if (bubble.isPopped) return bubble;

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
                    nextProgress += (0.065 / Math.max(0.4, settings.holdTimeToPop));
                    sound.playChargeTick(nextProgress);

                    if (nextProgress >= 1 && !isAnswered) {
                      setTimeout(() => handleSelectOption(bIdx), 5);
                      return { ...bubble, fillProgress: 1, motionIntensity: motionRatio, isHovered: true };
                    }
                  } else {
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
          }

          prevFrameRef.current = currentFrame;
        }
      }

      animId = requestAnimationFrame(processMotion);
    };

    animId = requestAnimationFrame(processMotion);

    return () => cancelAnimationFrame(animId);
  }, [gameState, isCamActive, isAnswered, gameMode, settings.mirrorCamera, settings.motionSensitivity, settings.holdTimeToPop, handleSelectOption]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        stats={stats}
        soundEnabled={settings.soundEnabled}
        gameMode={gameMode}
        onlineRoom={onlineRoom}
        onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        onOpenMultiplayer={() => setIsMultiplayerModalOpen(true)}
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
            onOpenMultiplayer={() => setIsMultiplayerModalOpen(true)}
            isCameraSupported={typeof navigator !== 'undefined' && !!navigator.mediaDevices}
            isCamActive={isCamActive}
          />
        )}

        {/* ACTIVE PLAYING SCREEN (SOLO OR ONLINE) */}
        {gameState === 'playing' && gameMode !== 'local_versus' && activeQuestions.length > 0 && (
          <ActiveGameArena
            currentQuestion={activeQuestions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            timeLeft={timeLeft}
            maxTime={maxTime}
            bubbles={bubbles}
            selectedAnswerIndex={selectedAnswerIndex}
            isAnswered={isAnswered}
            gameMode={gameMode}
            onlinePlayers={onlineRoom?.players}
            versusPlayers={versusPlayers}
            myPlayerId={myPlayerId}
            roundWinnerMessage={roundWinnerMessage}
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

        {/* ACTIVE PLAYING SCREEN (1 VS 1 SPLIT SCREEN LOCAL VERSUS) */}
        {gameState === 'playing' && gameMode === 'local_versus' && activeQuestions.length > 0 && (
          <SplitScreenVersusArena
            currentQuestion={activeQuestions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            timeLeft={timeLeft}
            maxTime={maxTime}
            p1Bubbles={p1Bubbles}
            p2Bubbles={p2Bubbles}
            selectedAnswerIndex={selectedAnswerIndex}
            roundWinnerPlayerId={roundWinnerPlayerId}
            isAnswered={isAnswered}
            versusPlayers={versusPlayers}
            roundWinnerMessage={roundWinnerMessage}
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

        {/* GAME OVER & PODIUM SCREEN (SOLO) */}
        {gameState === 'gameover' && gameMode === 'solo' && (
          <GameOverModal
            stats={stats}
            totalQuestions={activeQuestions.length}
            questionHistory={questionHistory}
            onRestart={startGameplay}
            onGoHome={() => setGameState('start')}
          />
        )}

        {/* GAME OVER & PODIUM SCREEN (MULTIPLAYER & VERSUS) */}
        {gameState === 'gameover' && gameMode !== 'solo' && (
          <MultiplayerPodiumModal
            gameMode={gameMode}
            onlinePlayers={onlineRoom?.players}
            versusPlayers={versusPlayers}
            isHost={onlineRoom?.hostId === myPlayerId}
            onRestart={() => {
              if (gameMode === 'local_versus') {
                handleStartLocalVersus(versusPlayers[0].name, versusPlayers[1].name);
              } else if (gameMode === 'online_multiplayer') {
                mpSocket.send('RESTART_ROOM');
                setIsMultiplayerModalOpen(true);
                setGameState('start');
              }
            }}
            onGoHome={() => {
              setGameState('start');
              setGameMode('solo');
            }}
          />
        )}

      </main>

      {/* Multiplayer Lobby Modal */}
      <MultiplayerLobbyModal
        isOpen={isMultiplayerModalOpen}
        onClose={() => setIsMultiplayerModalOpen(false)}
        onlineRoom={onlineRoom}
        myPlayerId={myPlayerId}
        isConnecting={isConnecting}
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        onStartOnlineGame={handleStartOnlineGame}
        onStartLocalVersus={handleStartLocalVersus}
        onUpdateCategory={handleUpdateCategory}
      />

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
