import api from "../lib/api";

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

const reimbursementService = {
  getMyReimbursements: async (params) => {
    const response = await api.get("/reimbursements/my", { params });
    return response.data;
  },

  getReimbursementById: async (id) => {
    const response = await api.get(`/reimbursements/${id}`);
    return response.data;
  },

  createReimbursement: async (formData) => {
    const response = await api.post(
      "/reimbursements",
      formData,
      multipartConfig,
    );
    return response.data;
  },

  updateReimbursement: async (id, formData) => {
    const response = await api.put(
      `/reimbursements/${id}`,
      formData,
      multipartConfig,
    );
    return response.data;
  },

  submitReimbursement: async (id) => {
    const response = await api.post(`/reimbursements/${id}/submit`);
    return response.data;
  },

  getAdminReimbursements: async (params) => {
    const response = await api.get("/admin/reimbursements", { params });
    return response.data;
  },

  getAdminReimbursementById: async (id) => {
    const response = await api.get(`/admin/reimbursements/${id}`);
    return response.data;
  },

  approveReimbursement: async (id, payload) => {
    const response = await api.post(
      `/admin/reimbursements/${id}/approve`,
      payload,
    );
    return response.data;
  },

  disapproveReimbursement: async (id, payload) => {
    const response = await api.post(
      `/admin/reimbursements/${id}/disapprove`,
      payload,
    );
    return response.data;
  },

  requestResubmission: async (id, payload) => {
    const response = await api.post(
      `/admin/reimbursements/${id}/request-resubmission`,
      payload,
    );
    return response.data;
  },

  resendApprovedEmail: async (id) => {
    const response = await api.post(
      `/admin/reimbursements/${id}/resend-approved-email`,
    );
    return response.data;
  },
};

export default reimbursementService;
