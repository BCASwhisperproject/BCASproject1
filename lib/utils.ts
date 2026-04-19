import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const CATEGORY_LABELS: Record<string, string> = {
  love: "Love",
  confession: "Confession",
  tea: "Tea",
  bite: "Back Bitch",
  rateme: "Rate Me",
  secret: "Secret Reveal",
  news: "News",
  other: "Others",
};

export const CATEGORY_ICONS: Record<string, string> = {
  love: "💗",
  confession: "🤫",
  tea: "☕",
  bite: "🔥",
  rateme: "⭐",
  secret: "🔐",
  news: "📰",
  other: "🫧",
};

export const ALLOWED_REACTIONS = ["😂", "🔥", "💀", "😮", "❤️", "👍"] as const;

export const AVATAR_GRADIENTS: Record<string, string> = {
  "gradient-purple": "linear-gradient(135deg,#7C3AED,#A78BFA)",
  "gradient-pink": "linear-gradient(135deg,#EC4899,#F9A8D4)",
  "gradient-teal": "linear-gradient(135deg,#0D9488,#34D399)",
  "gradient-orange": "linear-gradient(135deg,#EA580C,#FDBA74)",
  "gradient-green": "linear-gradient(135deg,#15803D,#4ADE80)",
  "gradient-navy": "linear-gradient(135deg,#2D3748,#7B87A0)",
  "gradient-slate": "linear-gradient(135deg,#4A5568,#7B87A0)",
};

export const AVATAR_COLORS = Object.keys(AVATAR_GRADIENTS);

const ADJECTIVES = ["Sneaky","Cosmic","Velvet","Midnight","Shadow","Neon","Mystic","Silent","Wild","Dreamy","Fuzzy","Chaos","Lunar","Echo","Turbo","Blaze","Crispy","Glitchy","Spicy","Frosted","Savage","Cursed","Phantom","Stormy","Electric"];
const ANIMALS    = ["Panda","Falcon","Otter","Narwhal","Gecko","Moth","Fox","Raven","Llama","Axolotl","Capybara","Platypus","Ferret","Quokka","Mantis","Chameleon","Tapir","Binturong","Kinkajou","Pangolin","Fossa","Numbat","Wallaby","Wombat","Dugong"];

export function generateUsername() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

export function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function getAvatarGradient(color: string) {
  return AVATAR_GRADIENTS[color] ?? AVATAR_GRADIENTS["gradient-purple"];
}

export const DAILY_POST_LIMIT = 2;

export const BLOCKED_WORDS: string[] = [];

export function containsBlocked(text: string) {
  const l = text.toLowerCase();
  return BLOCKED_WORDS.some((w) => l.includes(w));
}

export const OFFENSIVE_KEYWORDS = ["hate","kill","die","ugly","stupid","loser"];

export function isLikelyOffensive(text: string) {
  const l = text.toLowerCase();
  return OFFENSIVE_KEYWORDS.filter((w) => l.includes(w)).length >= 2;
}
