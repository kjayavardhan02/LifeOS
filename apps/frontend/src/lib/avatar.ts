export function getAvatarUrl(seed: string, size = 128): string {
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}
