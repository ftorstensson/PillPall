
import type { NavItem, StoreItem, Medication, Reminder, MoodEntry, Helper, UserProfile } from './types';
import { LayoutDashboard, Pill, Bell, Users, Bot, Store as StoreIcon, Settings as SettingsIcon, CalendarDays, Thermometer, HeartPulse, Home, Smile, SmilePlus, Meh, Frown, Angry } from 'lucide-react'; // Added SmilePlus, Meh, Frown, Angry

export const APP_NAME = "PillPal"; // Updated from PillWise

export const NAV_ITEMS: NavItem[] = [
  { title: 'Home', href: '/', icon: Home }, // Changed Dashboard to Home
  { title: 'Medications', href: '/medications', icon: Pill },
  { title: 'Reminders', href: '/reminders', icon: Bell },
  { title: 'Mood Diary', href: '/mood-diary', icon: Smile },
  { title: 'Helpers', href: '/helpers', icon: Users }, // This could be "Family Sharing"
  { title: 'PillPal AI', href: '/assistant', icon: Bot }, // Updated from PillWise AI
  { title: 'Store', href: '/store', icon: StoreIcon },
  { title: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const MOCK_USER_PROFILE: UserProfile = {
  name: "Alex Doe",
  email: "alex.doe@example.com",
  avatarUrl: "https://placehold.co/100x100.png",
  subscriptionTier: "trial",
  trialEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
};

export const MOCK_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', schedule: 'Once daily in the morning', notes: 'For blood pressure', imageUrl: 'https://placehold.co/40x40.png', dataAiHint: 'pill' },
  { id: '2', name: 'Metformin', dosage: '500mg', schedule: 'Twice daily with meals', notes: 'For diabetes', imageUrl: 'https://placehold.co/40x40.png', dataAiHint: 'tablet' },
  { id: '3', name: 'Vitamin D3', dosage: '2000 IU', schedule: 'Once daily with breakfast', imageUrl: 'https://placehold.co/40x40.png', dataAiHint: 'capsule' },
];

export const MOCK_REMINDERS: Reminder[] = [
  { id: 'r1', medicationId: '1', medicationName: 'Lisinopril', time: '08:00', days: ['Daily'], isEnabled: true },
  { id: 'r2', medicationId: '2', medicationName: 'Metformin', time: '09:00', days: ['Daily'], isEnabled: true },
  { id: 'r3', medicationId: '2', medicationName: 'Metformin', time: '18:00', days: ['Daily'], isEnabled: true },
  { id: 'r4', medicationId: '3', medicationName: 'Vitamin D3', time: '08:30', days: ['Mon', 'Wed', 'Fri'], isEnabled: false },
];

// Stores { [dateISO: string]: { medStatus?: { [reminderId: string]: 'taken' | undefined }, mood?: Mood | null, notes?: string } }
export const MOCK_DAILY_MED_STATUSES: { [dateISO: string]: { medStatus?: { [reminderId: string]: 'taken' | undefined }, mood?: Mood | null, notes?: string } } = {};


export const MOCK_MOOD_ENTRIES: MoodEntry[] = [
  { id: 'm1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], mood: 'good', notes: 'Felt energetic.' },
  { id: 'm2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], mood: 'okay', notes: 'A bit tired.' },
  { id: 'm3', date: new Date().toISOString().split('T')[0], mood: 'great', notes: 'Productive day!'},
];

export const MOCK_HELPERS: Helper[] = [
  { id: 'h1', name: 'Jane Doe', relationship: 'Mother', contact: 'jane.doe@example.com', receivesNotifications: true },
  { id: 'h2', name: 'John Smith', relationship: 'Friend', contact: '+11234567890', receivesNotifications: false },
];

export const MOCK_STORE_ITEMS: StoreItem[] = [
  { id: 's1', name: 'PillPal Smart Dispenser', type: 'dispenser', price: '$79.99', imageUrl: 'https://placehold.co/300x200.png', description: 'Automated pill dispenser with app integration.', dataAiHint: 'medicine dispenser' },
  { id: 's2', name: 'PillPal Mini Dispenser', type: 'dispenser', price: '$49.99', imageUrl: 'https://placehold.co/300x200.png', description: 'Compact smart dispenser for travel.', dataAiHint: 'pill dispenser' },
  { id: 's3', name: 'Calm Waters Skin', type: 'skin', price: '$4.99', imageUrl: 'https://placehold.co/300x200.png', description: 'A soothing blue skin for your PillPal dispenser.', dataAiHint: 'abstract pattern' },
  { id: 's4', name: 'Forest Green Skin', type: 'skin', price: '$4.99', imageUrl: 'https://placehold.co/300x200.png', description: 'A vibrant green nature-themed skin.', dataAiHint: 'nature pattern' },
];

export const MOOD_OPTIONS: { value: MoodEntry['mood']; label: string; icon: React.ElementType }[] = [
    { value: 'great', label: 'Great', icon: SmilePlus },
    { value: 'good', label: 'Good', icon: Smile },
    { value: 'okay', label: 'Okay', icon: Meh },
    { value: 'bad', label: 'Bad', icon: Frown },
    { value: 'terrible', label: 'Terrible', icon: Angry },
  ];

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
