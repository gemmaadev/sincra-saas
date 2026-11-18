// Words are whitespace-separated. Parentheses, dashes and other punctuation are dropped
// so "Anna (Restaurant Can Vila)" becomes AR, not A(.
export function getInitials(name: string) {
  const words = name
    .split(/\s+/u)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((part) => part.length > 0)

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}
