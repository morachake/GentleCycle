// Core Types for GentleCycle Period Tracking App

export interface Cycle {
  id: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  periodDays: number[];
  cycleLength?: number;
  averageFlow: FlowIntensity;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Period {
  id: string;
  cycleId: string;
  startDate: string;
  endDate?: string;
  days: PeriodDay[];
  createdAt: string;
  updatedAt: string;
}

export interface PeriodDay {
  id: string;
  periodId: string;
  date: string; // ISO date string
  flow: FlowIntensity;
  symptoms: Symptom[];
  notes?: string;
}

export enum FlowIntensity {
  NONE = 'none',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SPOTTING = 'spotting'
}

export interface Symptom {
  id: string;
  type: SymptomType;
  severity: SymptomSeverity;
  date: string;
  notes?: string;
}

export enum SymptomType {
  // Physical Symptoms
  CRAMPS = 'cramps',
  BLOATING = 'bloating',
  HEADACHE = 'headache',
  BREAST_TENDERNESS = 'breast_tenderness',
  NAUSEA = 'nausea',
  FATIGUE = 'fatigue',
  BACKACHE = 'backache',
  
  // Emotional Symptoms
  MOOD_SWINGS = 'mood_swings',
  IRRITABILITY = 'irritability',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  
  // Skin & Hair
  ACNE = 'acne',
  OILY_SKIN = 'oily_skin',
  DRY_SKIN = 'dry_skin',
  
  // Sleep & Energy
  INSOMNIA = 'insomnia',
  LOW_ENERGY = 'low_energy',
  HIGH_ENERGY = 'high_energy',
  
  // Custom
  CUSTOM = 'custom'
}

export enum SymptomSeverity {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  EXTREME = 4
}

export interface DailyEntry {
  id: string;
  date: string;
  mood: MoodType;
  energyLevel: number; // 1-5 scale
  symptoms: Symptom[];
  weight?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MoodType {
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  ANGRY = 'angry',
  ANXIOUS = 'anxious',
  EXCITED = 'excited',
  TIRED = 'tired',
  STRESSED = 'stressed'
}

export interface UserProfile {
  id: string;
  age?: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  periodReminder: boolean;
  periodReminderDays: number; // days before predicted period
  fertilityReminder: boolean;
  symptomReminder: boolean;
  medicationReminder: boolean;
  customReminders: CustomReminder[];
}

export interface CustomReminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  enabled: boolean;
  repeatDays: number[]; // 0-6, days of week
}

export interface PrivacySettings {
  requireAuth: boolean;
  useFingerprint: boolean;
  autoLockMinutes: number;
  hideFromRecent: boolean;
}

export interface Prediction {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDate: string;
  fertilityWindowStart: string;
  fertilityWindowEnd: string;
  confidence: number; // 0-1
}

export interface CycleStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleRegularity: number; // 0-1, 1 being very regular
  mostCommonSymptoms: SymptomType[];
  moodPatterns: MoodPattern[];
}

export interface MoodPattern {
  phase: CyclePhase;
  dominantMood: MoodType;
  frequency: number;
}

export enum CyclePhase {
  MENSTRUAL = 'menstrual',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal'
}

export enum PregnancyRisk {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface PregnancyRiskData {
  risk: PregnancyRisk;
  percentage: number;
  message: string;
  tips: string[];
}

// Calendar Types
export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay?: number;
  phase?: CyclePhase;
  flow?: FlowIntensity;
  symptoms: SymptomType[];
  mood?: MoodType;
  hasPrediction: boolean;
}

// Export/Import Types
export interface ExportData {
  version: string;
  exportDate: string;
  userProfile: UserProfile;
  cycles: Cycle[];
  periods: Period[];
  dailyEntries: DailyEntry[];
  symptoms: Symptom[];
}

// Component Props Types
export interface NavigationProps {
  navigation: any; // Replace with proper navigation type when available
  route: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}