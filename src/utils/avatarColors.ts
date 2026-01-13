// Multi-color avatar system - generates consistent colors based on name
const AVATAR_COLORS = [
  { bg: 'from-rose-500 to-pink-600', text: 'text-white' },
  { bg: 'from-violet-500 to-purple-600', text: 'text-white' },
  { bg: 'from-blue-500 to-cyan-600', text: 'text-white' },
  { bg: 'from-emerald-500 to-teal-600', text: 'text-white' },
  { bg: 'from-amber-500 to-orange-600', text: 'text-white' },
  { bg: 'from-red-500 to-rose-600', text: 'text-white' },
  { bg: 'from-indigo-500 to-blue-600', text: 'text-white' },
  { bg: 'from-green-500 to-emerald-600', text: 'text-white' },
  { bg: 'from-yellow-500 to-amber-600', text: 'text-white' },
  { bg: 'from-fuchsia-500 to-pink-600', text: 'text-white' },
  { bg: 'from-cyan-500 to-blue-600', text: 'text-white' },
  { bg: 'from-lime-500 to-green-600', text: 'text-white' },
];

/**
 * Generate a consistent color index based on a string (name)
 * Uses simple hash to ensure same name always gets same color
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get avatar color classes based on customer name
 */
export function getAvatarColor(name: string): { bg: string; text: string } {
  const index = hashString(name) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get avatar gradient class string
 */
export function getAvatarGradient(name: string): string {
  const color = getAvatarColor(name);
  return `bg-gradient-to-br ${color.bg}`;
}

/**
 * Get avatar text color class
 */
export function getAvatarTextColor(name: string): string {
  const color = getAvatarColor(name);
  return color.text;
}
