export const LEVELS = [
  { xp: 0, title: "Recém-nascido" },
  { xp: 100, title: "Curioso" },
  { xp: 300, title: "Mini Gênio" },
  { xp: 600, title: "Sabichão" },
  { xp: 1000, title: "Mestre do Saber" }
];

export const getLevelTitle = (xp: number) => {
  const level = LEVELS.slice().reverse().find(l => xp >= l.xp);
  return level ? level.title : LEVELS[0].title;
};

// Calculate age in days
export const getAgeInDays = (birthDate: number) => {
  const diff = Date.now() - birthDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days === 0 ? 1 : days; // Start at day 1
};
