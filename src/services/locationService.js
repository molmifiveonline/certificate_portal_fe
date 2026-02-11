import api from "../lib/api";

const locationService = {
  getLocations: async (params) => {
    const response = await api.get("/locations", { params });
    return response.data;
  },

  getLocationById: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  createLocation: async (data) => {
    const response = await api.post("/locations", data);
    return response.data;
  },

  updateLocation: async (id, data) => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};

export default locationService;
