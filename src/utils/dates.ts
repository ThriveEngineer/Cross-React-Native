import { format, isToday, isTomorrow, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const getDateLabel = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';

    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  } catch {
    return '';
  }
};

export const getDayNumber = (): string => {
  return format(new Date(), 'd');
};

export const getMonthNameShort = (): string => {
  return format(new Date(), 'MMM');
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const compareTimestamps = (t1?: string, t2?: string): number => {
  if (!t1 && !t2) return 0;
  if (!t1) return -1;
  if (!t2) return 1;

  try {
    const dt1 = parseISO(t1);
    const dt2 = parseISO(t2);
    return dt1.getTime() - dt2.getTime();
  } catch {
    return 0;
  }
};

export const formatDateForNotion = (dateString: string | undefined): string | null => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    return format(date, 'yyyy-MM-dd');
  } catch {
    return null;
  }
};

export const groupTasksByDate = <T extends { dueDate?: string }>(
  tasks: T[]
): Map<string, T[]> => {
  const groups = new Map<string, T[]>();

  tasks.forEach(task => {
    const label = task.dueDate ? getDateLabel(task.dueDate) : 'No Date';
    const existing = groups.get(label) || [];
    groups.set(label, [...existing, task]);
  });

  return groups;
};
