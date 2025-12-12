
export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface QuizItem {
  question: string;
  type: 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'Application';
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Flashcard {
  front: string;
  back: string;
  tag: 'Concept' | 'Definition' | 'Formula';
}

export interface ExamQuestion {
  question: string;
  marks: number;
  estimatedTime: string; // e.g. "5 mins"
  solutionKey: string;
}

export interface LearningPath {
  weakAreas: string[];
  nextSteps: string[];
  feedback: string;
}

export interface Productivity {
  summary: string;
  keyPoints: string[];
  mindMapDescription: string;
}

export interface VideoInsight {
  timestamp: string;
  trigger: string;
  explanation: string;
}

export interface BookmarkItem {
  id: string;
  type: 'lightbulb' | 'correction' | 'analogy' | 'summary' | 'keypoint' | 'insight' | 'flashcard' | 'exam';
  title: string;
  content: any;
}

export interface LearnSenseResponse {
  lightbulbMoment: string;
  noteCorrection: {
    studentQuote: string;
    correction: string;
    timestampReference: string;
  };
  visualAnalogy: {
    description: string;
    diagramSuggestion: string;
  };
  learningPath: LearningPath;
  productivity: Productivity;
  videoTutor: {
    insights: VideoInsight[];
  };
  assessmentTools: {
    quiz: QuizItem[];
    flashcards: Flashcard[];
    examPractice: ExamQuestion[];
  };
}

export interface AnalysisState {
  status: AnalysisStatus;
  data: LearnSenseResponse | null;
  error: string | null;
}

// --- Monetization Types ---

export type PlanTier = 'free' | 'pro_monthly' | 'pro_yearly';

export interface UserProfile {
  email: string;
  name?: string;
  plan: PlanTier;
  tokenBalance: number;
  subscriptionEndDate?: string;
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'forever';
  tokens: number | 'Unlimited';
  features: string[];
  recommended?: boolean;
}

export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  currency: string;
}
