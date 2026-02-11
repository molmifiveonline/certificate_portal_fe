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
};

export default candidateService;
