import api from "../lib/api";

const hotelService = {
  getAllHotels: async (params) => {
    const response = await api.get("/hotel-details", { params });
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await api.get(`/hotel-details/${id}`);
    return response.data;
  },

  createHotel: async (formData) => {
    const response = await api.post("/hotel-details", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateHotel: async (id, formData) => {
    const response = await api.put(`/hotel-details/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await api.delete(`/hotel-details/${id}`);
    return response.data;
  },

  deleteHotelFile: async (fileId) => {
    const response = await api.delete(`/hotel-details/file/${fileId}`);
    return response.data;
  },
};

export default hotelService;
