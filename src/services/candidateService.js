import api from "../lib/api";
import { sanitizeNumericValue } from "../lib/utils/validation";

const IMPORT_PHONE_FIELD_KEYS = new Set([
  "mobile",
  "mobileno",
  "mobilenumber",
  "mobilephone",
  "whatsapp",
  "whatsappnumber",
  "alternatenumber",
  "alternatemobile",
  "alternatemobileno",
  "alternatemobilenumber",
  "altmobile",
  "phone",
  "phonenumber",
]);

const normalizeImportFieldKey = (key = "") =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const sanitizeImportedCandidateValue = (key, value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return IMPORT_PHONE_FIELD_KEYS.has(normalizeImportFieldKey(key))
    ? sanitizeNumericValue(trimmedValue)
    : trimmedValue;
};

const sanitizeImportedCandidate = (candidate = {}) =>
  Object.fromEntries(
    Object.entries(candidate).map(([key, value]) => [
      key,
      sanitizeImportedCandidateValue(key, value),
    ]),
  );

const sanitizeBulkImportPayload = (payload) => {
  if (Array.isArray(payload)) {
    return { candidates: payload.map(sanitizeImportedCandidate) };
  }

  const nextPayload = { ...(payload || {}) };
  if (typeof nextPayload.syncDate === "string") {
    nextPayload.syncDate = nextPayload.syncDate.trim();
  }
  if (Array.isArray(nextPayload.candidates)) {
    nextPayload.candidates = nextPayload.candidates.map(sanitizeImportedCandidate);
  }

  return nextPayload;
};

const candidateService = {
  getAllCandidates: async (params) => {
    const response = await api.get("/candidate", { params });
    return response.data;
  },

  deleteCandidate: async (id) => {
    const response = await api.delete(`/candidate/delete/${id}`);
    return response.data;
  },

  getCandidateById: async (id) => {
    const response = await api.get(`/candidate/${id}`);
    return response.data;
  },

  updateCandidate: async (id, data) => {
    const response = await api.put(`/candidate/update/${id}`, data);
    return response.data;
  },

  exportCandidates: async (params = {}) => {
    const response = await api.get("/candidate/export", {
      responseType: "blob",
      params,
    });
    return response;
  },

  uploadCandidates: async (formData) => {
    const response = await api.post("/candidate/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(
      "/candidate/upload-profile-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  importFromApi: async (date) => {
    const response = await api.post("/candidate/import-api", { date });
    return response.data;
  },

  fetchExternalPreview: async (date) => {
    const response = await api.post("/candidate/fetch-external-preview", { date });
    return response.data;
  },

  confirmBulkImport: async (payload) => {
    const requestPayload = sanitizeBulkImportPayload(payload);
    const response = await api.post("/candidate/confirm-bulk-import", requestPayload);
    return response.data;
  },

  getSyncHistory: async (params = {}) => {
    const response = await api.get("/candidate/sync-history", { params });
    return response.data;
  },

  getMergePreview: async (candidateIds = []) => {
    const response = await api.post("/candidate/merge-preview", { candidate_ids: candidateIds });
    return response.data;
  },

  mergeCandidates: async (payload = {}) => {
    const response = await api.post("/candidate/merge", payload);
    return response.data;
  },
};

export default candidateService;
