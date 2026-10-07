export function getInitials(fullName: string) {
  const firstWord = fullName.trim().split(/\s+/)[0] ?? '';
  return firstWord.slice(0, 2).toUpperCase();
}
