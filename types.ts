export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  DASHBOARD = 'DASHBOARD',
  TEACH = 'TEACH',
  CHAT = 'CHAT',
  REBIRTH = 'REBIRTH'
}

export enum BabyGender {
  BOY = 'Menino',
  GIRL = 'Menina',
  NEUTRAL = 'Neutro'
}

export interface User {
  username: string;
  password: string; // Na prática real, isso seria hash, mas para local serve texto
}

export interface BabyState {
  id: string;
  name: string;
  gender: BabyGender;
  birthDate: number; // Timestamp
  xp: number;
  level: string;
  mood: 'Feliz' | 'Triste' | 'Com fome' | 'Sonolento' | 'Curioso';
  userOwner: string;
  memory: string[]; // List of learned facts
  avatarImage?: string; // Base64 generated image
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}