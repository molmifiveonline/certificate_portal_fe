import api from "../lib/api";

const ReportService = {
  getFilterOptions: async () => {
    try {
      const response = await api.get(`/reports/filter-options`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportFeedbackReport: async (data) => {
    try {
      const response = await api.post(`/reports/feedback/export`, data, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportCertificateReport: async (data) => {
    try {
      const response = await api.post(`/reports/certificate/export`, data, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default ReportService;
