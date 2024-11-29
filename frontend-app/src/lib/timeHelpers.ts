export function convertTo24HourTime(hour: string, minute: string, period: string): string {
  let hours = parseInt(hour, 10);
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minute}`;
}

export function convertTo12HourTime(hour: string): { hour: string; minute: string; period: string } {
  const [hours, minutes] = hour?.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 || 12;
  return { hour: displayHours?.toString().padStart(2, '0'), minute: minutes?.toString().padStart(2, '0'), period };
}

export function calculateMillisecondsUntil(time: string, day: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);

  target.setHours(hours, minutes, 0, 0);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const targetDay = daysOfWeek.indexOf(day);

  while (target <= now || target.getDay() !== targetDay) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}
