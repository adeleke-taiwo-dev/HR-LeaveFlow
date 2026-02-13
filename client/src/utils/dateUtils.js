import { format, differenceInCalendarDays } from 'date-fns';

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateInput(date) {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  // Count business days (exclude weekends)
  while (current <= end) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}
