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

  closeAndConvert: async (id) => {
    const response = await api.post(`/pre-active/${id}/close`);
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

  getRejectedCandidateApprovals: async (params) => {
    const response = await api.get("/pre-active/rejected-approvals", {
      params,
    });
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

  getNominatorToken: async (id) => {
    const response = await api.get(`/pre-active/${id}/token`);
    return response.data;
  },
  // Public Endpoints
  getCourseByToken: async (token) => {
    const response = await api.get(`/pre-active/public/token/${token}`);
    return response.data;
  },

  getAvailableOthersCandidates: async (token) => {
    const response = await api.get(
      `/pre-active/public/token/${token}/available-candidates`,
    );
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

  downloadExcelTemplate: async () => {
    const response = await api.get("/pre-active/excel/sample-template", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pre_active_courses_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  uploadExcelPreview: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/pre-active/excel/upload-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  confirmExcelImport: async (data) => {
    const response = await api.post("/pre-active/excel/confirm-import", data);
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

  getAvailableOthersCandidatesByAdmin: async (id) => {
    const response = await api.get(`/pre-active/${id}/available-candidates`);
    return response.data;
  },

  adminAddCandidate: async (id, data) => {
    const response = await api.post(`/pre-active/${id}/add-candidate`, data);
    return response.data;
  },

  getCandidateNominations: async (params) => {
    const response = await api.get("/pre-active/candidate/nominations", {
      params,
    });
    return response.data;
  },

  submitCandidateNominationDecision: async (enrollmentId, data) => {
    const response = await api.post(
      `/pre-active/candidate/nomination/${enrollmentId}/decision`,
      data,
    );
    return response.data;
  },
};

export default preActiveCourseService;

