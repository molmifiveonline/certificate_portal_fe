import api from "../lib/api";

const feedbackFormService = {
  getAll: async (params) => {
    const response = await api.get("/feedback-forms", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feedback-forms/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/feedback-forms", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/feedback-forms/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/feedback-forms/${id}`);
    return response.data;
  },
};

export default feedbackFormService;
