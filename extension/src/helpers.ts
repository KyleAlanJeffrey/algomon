export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const blacklistWords = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "at",
  "with",
  "without",
  "for",
  "from",
  "by",
  "about",
  "is",
  "are",
  "what",
  "why",
  "how",
  "i",
  "my",
  "into",
  "more",
  'dir="auto"',
  "<span",
  "&amp",
  "&amp;",
  'class="style-scope',
  "style-scope",
  "video)",
  "this",
  "be",
  "can",
  "you",
  "&",
  "it",
  "so",
];
const userBlacklistWords = ["(official"];
