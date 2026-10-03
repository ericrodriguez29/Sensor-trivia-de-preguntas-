export interface Question {
  id: string;
  category: string;
  categoryIcon: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface BubbleState {
  id: number;
  letter: string;
  text: string;
  color: 'rose' | 'cyan' | 'amber' | 'emerald';
  xPercent: number; // Center X (0-100)
  yPercent: number; // Center Y (0-100)
  radiusPercent: number; // Radius in percent of container
  fillProgress: number; // 0 to 1
  motionIntensity: number; // 0 to 100
  isHovered: boolean;
  isPopped: boolean;
  floatDelay: string;
  animClass: string;
}

export interface GameSettings {
  motionSensitivity: number; // 10 to 60 (lower = more sensitive)
  holdTimeToPop: number; // 0.4s to 2.5s
  soundEnabled: boolean;
  mirrorCamera: boolean;
  showMotionHeatmap: boolean;
  bubbleFloatSpeed: 'gentle' | 'normal' | 'dynamic';
}

export interface UserStats {
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  totalAnswered: number;
  timeBonusTotal: number;
}

export interface MotionDetectionInfo {
  activeBubbleId: number | null;
  overallMotion: number;
  detectedX: number;
  detectedY: number;
}
