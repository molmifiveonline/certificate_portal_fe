import api from "../lib/api";

const feedbackQuestionService = {
  getAll: async (params) => {
    const response = await api.get("/feedback-questions", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/feedback-questions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/feedback-questions", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/feedback-questions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/feedback-questions/${id}`);
    return response.data;
  },
};

export default feedbackQuestionService;
