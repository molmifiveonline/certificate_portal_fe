import api from "../lib/api";

const adminUserService = {
  getAdmins: async (params) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  getAdminById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createAdmin: async (data) => {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  updateAdmin: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default adminUserService;
