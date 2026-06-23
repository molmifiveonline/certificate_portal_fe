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

  exportTrainingRecordReport: async (data) => {
    try {
      const response = await api.post(`/reports/training-record/export`, data, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportTrainingActivitiesReport: async (data) => {
    try {
      const response = await api.post(
        `/reports/training-activities/export`,
        data,
        {
          responseType: "blob",
        },
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getHotelReport: async (params) => {
    try {
      const response = await api.get(`/reports/hotel`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  bulkDownloadFeedbackPDFs: async (data) => {
    try {
      const response = await api.post(
        `/reports/feedback/bulk-download-pdf`,
        data,
        {
          responseType: "blob",
        },
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default ReportService;
