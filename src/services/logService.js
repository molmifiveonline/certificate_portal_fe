import api from "../lib/api";

const logService = {
  getLogs: async (params = {}) => {
    try {
      const { page, limit, search, userId } = params;
      const queryParams = {
        page,
        limit,
        search,
      };
      if (userId) queryParams.userId = userId;

      const response = await api.get("/log-history", { params: queryParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteLog: async (id) => {
    try {
      const response = await api.delete(`/log-history/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default logService;
