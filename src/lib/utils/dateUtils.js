/**
 * Format a date object or string to DD/MM/YYYY
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string or "-" if invalid
 */
export const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

/**
 * Format a date object or string to DD/MM/YYYY HH:mm:ss
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date time string or "-" if invalid
 */
export const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
    .format(d)
    .toUpperCase(); // 12/02/2026 12:30:00 PM
};

/**
 * Get current date in YYYY-MM-DD format for input type="date" value
 * @returns {string}
 */
export const getCurrentDateForInput = () => {
  return new Date().toISOString().split("T")[0];
};
