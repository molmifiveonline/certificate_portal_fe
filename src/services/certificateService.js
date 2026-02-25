import api from "../lib/api";

const certificateService = {
  getAllCertificates: async (params) => {
    const response = await api.get("/certificates", { params });
    return response.data;
  },

  getCertificateById: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },

  generateCertificate: async (data) => {
    const response = await api.post("/certificates/generate", data);
    return response.data;
  },

  updateCertificate: async (id, data) => {
    const response = await api.put(`/certificates/${id}`, data);
    return response.data;
  },

  deleteCertificate: async (id) => {
    const response = await api.delete(`/certificates/${id}`);
    return response.data;
  },

  createManualCertificate: async (data) => {
    const response = await api.post("/certificates", data);
    return response.data;
  },
};

export default certificateService;
