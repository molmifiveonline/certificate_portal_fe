import api from "../lib/api";

const notificationService = {
  getAdminNotifications: async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
  },
};

export default notificationService;
