// src/lib/timeHelpers.ts
export function convertTo24HourTime(hour: string, minute: string, period: string) {
  let hours = parseInt(hour, 10);
  if (period === 'PM' && hours < 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minute}`;
}

export function calculateMillisecondsUntil(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(hours, minutes, 0, 0);
  if (targetTime <= now) targetTime.setDate(targetTime.getDate() + 1);
  return targetTime.getTime() - now.getTime();
}
