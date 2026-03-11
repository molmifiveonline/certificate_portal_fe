import api from "../lib/api";

const preActiveCourseService = {
  create: async (data) => {
    const response = await api.post("/pre-active", data);
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get("/pre-active", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pre-active/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/pre-active/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pre-active/${id}`);
    return response.data;
  },

  notifyNominators: async (id) => {
    const response = await api.post(`/pre-active/${id}/notify-nominators`);
    return response.data;
  },

  notifyCandidates: async (id) => {
    const response = await api.post(`/pre-active/${id}/notify-candidates`);
    return response.data;
  },

  convertToActiveCourse: async (id) => {
    const response = await api.post(`/pre-active/${id}/convert`);
    return response.data;
  },

  getEnrolledCandidates: async (id) => {
    const response = await api.get(`/pre-active/${id}/candidates`);
    return response.data;
  },

  getPendingAdminApprovals: async (id) => {
    const response = await api.get(`/pre-active/${id}/admin-approvals`);
    return response.data;
  },

  adminApproval: async (enrollmentId, data) => {
    const response = await api.post(
      `/pre-active/admin-approval/${enrollmentId}`,
      data,
    );
    return response.data;
  },

  getAdminRemarksReport: async (params) => {
    const response = await api.get("/pre-active/report/admin-remarks", {
      params,
    });
    return response.data;
  },

  // Public Endpoints
  getCourseByToken: async (token) => {
    const response = await api.get(`/pre-active/public/token/${token}`);
    return response.data;
  },

  nominatorAddCandidate: async (token, data) => {
    const response = await api.post(
      `/pre-active/public/token/${token}/nominate`,
      data,
    );
    return response.data;
  },

  candidateApproval: async (token, data) => {
    const response = await api.post(
      `/pre-active/public/token/${token}/candidate-approval`,
      data,
    );
    return response.data;
  },

  fetchExternalCourses: async () => {
    const response = await api.post("/pre-active/fetch-external-preview");
    return response.data;
  },

  confirmBulkImport: async (data) => {
    const response = await api.post("/pre-active/confirm-bulk-import", data);
    return response.data;
  },
};

export default preActiveCourseService;
