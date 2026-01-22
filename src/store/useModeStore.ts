import { create } from 'zustand';

export type Mode = 'canvas' | '3d';

interface ModeState {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'canvas',
  setMode: (mode) => set({ mode }),
}));
