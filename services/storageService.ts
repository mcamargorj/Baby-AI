import { BabyState, BabyGender, User } from '../types';

const USERS_KEY = 'babyai_users_db';
const BABY_KEY_PREFIX = 'babyai_data_';

// --- User Management ---

const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (user: User): boolean => {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
    return false; // Usuário já existe
  }
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const validateUser = (username: string, password: string): boolean => {
  const users = getUsers();
  const user = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.password === password
  );
  return !!user;
};

// --- Baby Management ---

export const saveBaby = (baby: BabyState) => {
  // Salva o baby com uma chave única baseada no dono (usuário)
  const key = `${BABY_KEY_PREFIX}${baby.userOwner.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(baby));
};

export const loadBaby = (username: string): BabyState | null => {
  const key = `${BABY_KEY_PREFIX}${username.toLowerCase()}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  // Migration for older saves
  const parsed = JSON.parse(data);
  if (!parsed.memory) parsed.memory = [];
  return parsed;
};

export const createInitialBaby = (name: string, gender: BabyGender, userOwner: string, avatarImage?: string): BabyState => {
  return {
    id: crypto.randomUUID(),
    name,
    gender,
    birthDate: Date.now(),
    xp: 0,
    level: "Recém-nascido",
    mood: 'Curioso',
    userOwner,
    memory: [],
    avatarImage
  };
};

export const deleteBaby = (username: string) => {
  const key = `${BABY_KEY_PREFIX}${username.toLowerCase()}`;
  localStorage.removeItem(key);
};