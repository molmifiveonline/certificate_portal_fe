import api from "../lib/api";

export const systemManualService = {
  // Get all system manuals with pagination and search
  getSystemManuals: async (params) => {
    const response = await api.get("/system-manual", { params });
    return response.data;
  },

  // Get a single system manual by ID
  getSystemManualById: async (id) => {
    const response = await api.get(`/system-manual/${id}`);
    return response.data;
  },

  // Create a new system manual
  createSystemManual: async (formData) => {
    // Send form data since it includes files
    const response = await api.post("/system-manual", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update an existing system manual
  updateSystemManual: async (id, formData) => {
    // Send form data since it includes files
    const response = await api.put(`/system-manual/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete a system manual
  deleteSystemManual: async (id) => {
    const response = await api.delete(`/system-manual/${id}`);
    return response.data;
  },
};
