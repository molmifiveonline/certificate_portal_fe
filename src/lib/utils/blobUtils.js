/**
 * Parses a JSON error message from a Blob response (common when using responseType: 'blob' with Axios).
 * @param {Blob} blob - The blob containing the error JSON.
 * @returns {Promise<Object>} - The parsed JSON error object.
 */
export const parseBlobError = async (blob) => {
  if (!(blob instanceof Blob)) return null;

  try {
    const text = await blob.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse blob error:", e);
    return null;
  }
};
