import api from "../lib/api";

const outhouseCourseService = {
  getAll: async (params) => {
    const response = await api.get("/outhouse-courses", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/outhouse-courses/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/outhouse-courses", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/outhouse-courses/${id}`, data);
    return response.data;
  },

  getPreActiveCourses: async (params) => {
    const response = await api.get("/outhouse-courses/pre-active-options", {
      params,
    });
    return response.data;
  },

  getMasterCourses: async (params) => {
    const response = await api.get("/outhouse-courses/master-course-options", {
      params,
    });
    return response.data;
  },

  getCandidates: async (id, params) => {
    const response = await api.get(`/outhouse-courses/${id}/candidates`, {
      params,
    });
    return response.data;
  },

  getCandidateOptions: async (id, params) => {
    const response = await api.get(
      `/outhouse-courses/${id}/candidate-options`,
      {
        params,
      },
    );
    return response.data;
  },

  addCandidates: async (id, data) => {
    const response = await api.post(`/outhouse-courses/${id}/candidates`, data);
    return response.data;
  },

  updateCandidate: async (id, candidateId, data) => {
    const response = await api.put(
      `/outhouse-courses/${id}/candidates/${candidateId}`,
      data,
    );
    return response.data;
  },

  deleteCandidate: async (id, candidateId, data) => {
    const response = await api.delete(
      `/outhouse-courses/${id}/candidates/${candidateId}`,
      { data },
    );
    return response.data;
  },

  resendWelcomeLetter: async (id, candidateId) => {
    const response = await api.post(
      `/outhouse-courses/${id}/candidates/${candidateId}/welcome-letter`,
    );
    return response.data;
  },

  updateVenueDetails: async (id, candidateId, formData) => {
    const response = await api.post(
      `/outhouse-courses/${id}/candidates/${candidateId}/venue-details`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  getAttendance: async (id) => {
    const response = await api.get(`/outhouse-courses/${id}/attendance`);
    return response.data;
  },

  saveAttendance: async (id, data) => {
    const response = await api.post(`/outhouse-courses/${id}/attendance`, data);
    return response.data;
  },

  getFeedback: async (id) => {
    const response = await api.get(`/outhouse-courses/${id}/feedback`);
    return response.data;
  },

  uploadFeedbackDocument: async (id, formData) => {
    const response = await api.post(
      `/outhouse-courses/${id}/feedback/document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  resendFeedback: async (id, candidateId) => {
    const response = await api.post(
      `/outhouse-courses/${id}/feedback/${candidateId}/resend`,
    );
    return response.data;
  },

  downloadFeedback: async (id, candidateId) => {
    const response = await api.get(
      `/outhouse-courses/${id}/feedback/${candidateId}/download`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },

  acknowledgeEnrollment: async (data) => {
    const response = await api.post(
      "/outhouse-courses/acknowledge-enrollment",
      data,
    );
    return response.data;
  },

  getCertificates: async (id) => {
    const response = await api.get(`/outhouse-courses/${id}/certificates`);
    return response.data;
  },

  saveCertificate: async (id, candidateId, formData) => {
    const response = await api.post(
      `/outhouse-courses/${id}/certificates/${candidateId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};

export default outhouseCourseService;
