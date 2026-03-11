import api from "../lib/api";

const getDashboardStats = async () => {
    const response = await api.get("/trainer/dashboard-stats");
    return response.data;
};

const trainerService = {
    getDashboardStats,
};

export default trainerService;
