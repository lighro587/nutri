
export type View = 'dashboard' | 'nutrition' | 'mindfulness' | 'habits' | 'settings' | 'organization';

export interface User {
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
  bio?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  timezone?: string;
  personalizationMode?: 'Balanced' | 'Aggressive' | 'Minimal';
  dietarySuggestions?: boolean;
  notificationEnabled?: boolean;
  theme?: 'dark' | 'light';
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // ISO String
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  notified: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  pinned: boolean;
  color?: string;
}

export interface NutritionGoals {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface Recipe {
    name: string;
    calories: number;
    time: string;
    ingredients: string[];
    instructions?: string[];
}

export interface ScanResult {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  insight: string;
  image?: string;
  timestamp: Date;
  recipes?: Recipe[];
  healthScore?: number;
}

export interface Habit {
  id: string;
  title: string;
  category: 'Health' | 'Productivity' | 'Mindfulness' | 'Learning' | 'Social';
  streak: string;
  completed: boolean;
  tag: string;
  image: string;
  frequency?: string;
  icon?: string;
  reminderTime?: string; // Format: HH:MM
}

export interface AudioTrack {
    title: string;
    artist: string;
    url: string;
    image?: string;
}

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    mood: 'Happy' | 'Calm' | 'Neutral' | 'Sad' | 'Stressed';
    timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}
