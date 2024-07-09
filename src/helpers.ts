export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
