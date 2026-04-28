import { formatDate } from "../../../lib/utils/dateUtils";

export const generateDateRange = (start, end) => {
  const dates = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const formatDateDMY = (dateStr) => {
  return formatDate(dateStr);
};
