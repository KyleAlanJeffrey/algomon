export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const userBlacklistWords = ["most", "new", "1"];

export const blacklistWords = [
  "",
  "the",
  "as",
  "your",
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
  "The",
  "-",
  "|",
  "i",
  "a",
].concat(userBlacklistWords);

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  // zero padding
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  // zero padding
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
