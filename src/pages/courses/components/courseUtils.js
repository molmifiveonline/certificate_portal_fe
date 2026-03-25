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
  if (!dateStr) return "-";
  // dateStr can be YYYY-MM-DD or DD-MM-YY based on context
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return dateStr;
};
