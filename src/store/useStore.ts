import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  agentName: string;
  voiceEnabled: boolean;
}

interface AppState {
  user: FirebaseUser | null;
  loading: boolean;
  preferences: UserPreferences;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  loading: true,
  preferences: {
    theme: 'system',
    agentName: 'PersonalMind',
    voiceEnabled: false,
  },
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setPreferences: (prefs) => set((state) => ({
    preferences: { ...state.preferences, ...prefs }
  })),
}));
