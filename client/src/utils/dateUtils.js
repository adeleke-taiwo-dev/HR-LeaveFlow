import { format, differenceInCalendarDays } from 'date-fns';

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateInput(date) {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function calculateDays(startDate, endDate) {
  return differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
}
