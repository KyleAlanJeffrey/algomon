export const BLACKLIST = new Set([
  // Common stop words
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "as", "be", "was",
  "are", "were", "been", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "shall", "can",
  "not", "no", "nor", "so", "yet", "both", "either", "neither",
  "if", "then", "than", "that", "this", "these", "those", "what",
  "which", "who", "whom", "whose", "when", "where", "why", "how",
  "all", "any", "each", "every", "few", "more", "most", "other",
  "some", "such", "only", "own", "same", "too", "very", "just",
  "about", "above", "after", "before", "between", "into", "through",
  "during", "up", "down", "out", "off", "over", "under", "again",
  "here", "there", "once", "he", "she", "they", "we", "you", "i",
  "my", "your", "his", "her", "our", "their", "me", "him", "us",
  "them", "myself", "yourself", "himself", "herself", "itself",
  "ourselves", "themselves", "am", "being", "get", "got", "also",
  "back", "now", "even", "still", "well", "way", "because", "since",
  "while", "although", "though", "unless", "until", "after", "before",
  "new", "one", "two", "first", "last", "long", "great", "little",
  "own", "right", "old", "big", "high", "different", "small", "large",
  "next", "early", "young", "important", "public", "private", "real",
  "best", "free", "good", "bad", "never", "always", "often", "much",
  // YouTube / HTML artifacts
  "watch", "video", "youtube", "duration", "thumbnail", "channel",
  "subscribe", "playlist", "views", "amp", "https", "http", "www",
  "com", "net", "org", "redirect", "shorts", "live", "clip", "mix",
  // From existing server/frontend blacklists
  "without", "more", "this", "be", "can", "so",
])

export function extractWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map(w => w.replace(/^[-']+|[-']+$/g, ""))
    .filter(w => w.length > 2 && !BLACKLIST.has(w) && !/^\d+$/.test(w))
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0]!
}
