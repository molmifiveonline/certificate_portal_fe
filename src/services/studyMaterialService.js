import api from "../lib/api";

export const studyMaterialService = {
  // Get all study materials with pagination and search
  getStudyMaterials: async (params) => {
    const response = await api.get("/study-materials", { params });
    return response.data;
  },

  // Get a single study material by ID
  getStudyMaterialById: async (id) => {
    const response = await api.get(`/study-materials/${id}`);
    return response.data;
  },

  // Create a new study material
  createStudyMaterial: async (formData) => {
    // Send form data since it includes files
    const response = await api.post("/study-materials", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update an existing study material
  updateStudyMaterial: async (id, formData) => {
    // Send form data since it includes files
    const response = await api.put(`/study-materials/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete a study material
  deleteStudyMaterial: async (id) => {
    const response = await api.delete(`/study-materials/${id}`);
    return response.data;
  },
};
