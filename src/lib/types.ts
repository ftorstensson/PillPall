
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string; // e.g., "Twice a day at 8:00 AM and 6:00 PM"
  notes?: string;
  imageUrl?: string; // Optional image for the pill/medication
  dataAiHint?: string;
}

export interface Reminder {
  id: string;
  medicationId: string;
  medicationName?: string; // For display purposes
  time: string; // e.g., "08:00"
  days: string[]; // e.g., ["Mon", "Tue", "Wed"] or ["Daily"]
  isEnabled: boolean;
}

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  mood: Mood;
  notes?: string;
}

export interface Helper {
  id:string;
  name: string;
  relationship: string; // e.g., "Parent", "Child", "Friend"
  contact: string; // e.g., "email@example.com" or "+1234567890"
  receivesNotifications: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  type: 'dispenser' | 'skin';
  price: string;
  imageUrl: string;
  description: string;
  dataAiHint: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'trial' | 'pro';
  trialEnds?: Date;
}
