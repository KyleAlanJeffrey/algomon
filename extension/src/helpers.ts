export function getTodayDate() {
  // Get todays date at the start of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
