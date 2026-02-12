import api from "../lib/api";

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

  exportCandidates: async () => {
    const response = await api.get("/candidate/export", {
      responseType: "blob",
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
};

export default candidateService;
