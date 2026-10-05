/**
 * Utility functions for file URLs and downloading files
 */

export const getApiBaseUrl = () => {
  const rawUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const normalizedUrl = rawUrl.replace(/\/+$/, "");
  return /\/api$/i.test(normalizedUrl) ? normalizedUrl : `${normalizedUrl}/api`;
};

/**
 * Builds a full URL to an uploaded file, ensuring it points to the backend server.
 * Handles both relative and absolute paths.
 * @param {string} path - The file path or relative URL
 * @returns {string} - The full URL to access the file
 */
export const buildUploadUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = String(path).replace(/^\/+/, "");
  return `${getApiBaseUrl()}/${normalizedPath.replace(/^api\/+/i, "")}`;
};

/**
 * Downloads a file by fetching it as a Blob and triggering a browser download.
 * Works across all document types (PDF, images, Word, Excel, etc.) without navigating away.
 * Falls back to window.open if blob download fails.
 * @param {string} url - The URL to download
 * @param {string} fileName - The desired name for the downloaded file
 */
export const downloadFile = async (url, fileName) => {
  if (!url) return;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText} (${response.status})`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Direct download failed, falling back to open in new tab:", error);
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
