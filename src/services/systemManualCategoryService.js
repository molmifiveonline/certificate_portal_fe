import api from "../lib/api";

export const systemManualCategoryService = {
  // Get all categories with filtering/sorting/pagination
  getCategories: async (params) => {
    const response = await api.get("/system-manual-categories", { params });
    return response.data;
  },

  // Get a single category
  getCategoryById: async (id) => {
    const response = await api.get(`/system-manual-categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data) => {
    const response = await api.post("/system-manual-categories", data);
    return response.data;
  },

  // Update category
  updateCategory: async (id, data) => {
    const response = await api.put(`/system-manual-categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/system-manual-categories/${id}`);
    return response.data;
  },
};
