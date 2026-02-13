import api from "../lib/api";

const feedbackCategoryService = {
  getAll: async (params) => {
    const response = await api.get("/feedback-categories", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feedback-categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/feedback-categories", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/feedback-categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/feedback-categories/${id}`);
    return response.data;
  },
};

export default feedbackCategoryService;
