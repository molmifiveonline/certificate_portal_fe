const getDateOnlyParts = (date) => {
  if (typeof date !== "string") return null;
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z?)?$/);
  if (!match) return null;
  return {
    day: match[3],
    month: match[2],
    year: match[1],
  };
};

/**
 * Format a date object or string to YYYY-MM-DD for input type="date"
 * @param {string|Date} date - The date to format
 * @returns {string} - Date input value or empty string if invalid
 */
export const formatDateForInput = (date) => {
  if (!date) return "";

  if (typeof date === "string") {
    const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
      return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
    }
  }

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

/**
 * Format a date object or string to DD/MM/YYYY
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string or "-" if invalid
 */
export const formatDate = (date) => {
  if (!date) return "-";

  const dateOnlyParts = getDateOnlyParts(date);
  if (dateOnlyParts) {
    return `${dateOnlyParts.day}/${dateOnlyParts.month}/${dateOnlyParts.year}`;
  }

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

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
  if (Number.isNaN(d.getTime())) return "-";

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
  return formatDateForInput(new Date());
};
