import api from "../lib/api";

const ReportService = {
  exportFeedbackReport: async (data) => {
    try {
      const response = await api.post(`/reports/feedback/export`, data, {
        responseType: "blob", // Important for file download
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
