import api from "../lib/api";

const activeCourseService = {
  // Course CRUD
  createCourse: async (data) => {
    const response = await api.post("/active-courses", data);
    return response.data;
  },

  getAllCourses: async (params) => {
    const response = await api.get("/active-courses", { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/active-courses/${id}`);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await api.put(`/active-courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/active-courses/${id}`);
    return response.data;
  },

  // Course Lifecycle
  cancelCourse: async (id, reason) => {
    const response = await api.post(`/active-courses/${id}/cancel`, { reason });
    return response.data;
  },

  completeCourse: async (id, reason) => {
    const response = await api.post(`/active-courses/${id}/complete`, {
      reason,
    });
    return response.data;
  },

  // Candidate Enrollment
  getEnrolledCandidates: async (id) => {
    const response = await api.get(`/active-courses/${id}/candidates`);
    return response.data;
  },

  enrollCandidates: async (id, candidateIds, trainerId) => {
    const response = await api.post(`/active-courses/${id}/candidates`, {
      candidateIds,
      trainerId,
    });
    return response.data;
  },

  removeCandidate: async (id, candidateId, remark) => {
    const response = await api.delete(
      `/active-courses/${id}/candidates/${candidateId}`,
      { data: { remark } },
    );
    return response.data;
  },

  updateStatusPool: async (id, candidateId, statusPool) => {
    const response = await api.put(
      `/active-courses/${id}/candidates/${candidateId}/status-pool`,
      { statusPool },
    );
    return response.data;
  },

  updateObserverStatus: async (id, candidateId, isObserver) => {
    const response = await api.put(
      `/active-courses/${id}/candidates/${candidateId}/observer`,
      { isObserver },
    );
    return response.data;
  },

  getAvailableCandidates: async (id) => {
    const response = await api.get(
      `/active-courses/${id}/available-candidates`,
    );
    return response.data;
  },

  emailPrimaryTrainer: async (id) => {
    const response = await api.post(
      `/active-courses/${id}/email-primary-trainer`,
    );
    return response.data;
  },

  emailCandidate: async (id, candidateId, type) => {
    const response = await api.post(
      `/active-courses/${id}/candidates/${candidateId}/email`,
      { type },
    );
    return response.data;
  },

  emailCandidatesBulk: async (id, candidateIds) => {
    const response = await api.post(
      `/active-courses/${id}/candidates/email/bulk`,
      { candidateIds },
    );
    return response.data;
  },

  getCandidateVenue: async (id, candidateId) => {
    const response = await api.get(
      `/active-courses/${id}/candidates/${candidateId}/venue`,
    );
    return response.data;
  },

  updateCandidateVenue: async (id, candidateId, formData) => {
    const response = await api.post(
      `/active-courses/${id}/candidates/${candidateId}/venue`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Attendance Tab
  getAttendance: async (id) => {
    const response = await api.get(`/active-courses/${id}/attendance`);
    return response.data;
  },

  saveAttendanceSingle: async (
    courseId,
    candidateId,
    date,
    status,
    reason = null,
  ) => {
    const response = await api.post(
      `/active-courses/${courseId}/attendance/single`,
      {
        candidateId,
        date,
        status,
        reason,
      },
    );
    return response.data;
  },

  saveAbsentReason: async (id, absentReasons, status) => {
    const response = await api.post(
      `/active-courses/${id}/attendance/absent-reason`,
      { absentReasons, status },
    );
    return response.data;
  },

  // Assessment Tab
  getAssessmentScores: async (id) => {
    const response = await api.get(`/active-courses/${id}/assessment-scores`);
    return response.data;
  },

  sendAssessmentEmail: async (courseId, candidateId, assessmentId) => {
    const response = await api.post(
      `/active-courses/${courseId}/email/assessment`,
      { candidateId, assessmentId },
    );
    return response.data;
  },

  updateTrainerComment: async (courseId, candidateId, comment) => {
    const response = await api.put(`/active-courses/${courseId}/trainer-comment`, {
      candidateId,
      comment,
    });
    return response.data;
  },

  // Feedback Tab
  getFeedbackStatus: async (id) => {
    const response = await api.get(`/active-courses/${id}/feedback-status`);
    return response.data;
  },

  // Certificate Tab
  getCertificateData: async (id) => {
    const response = await api.get(`/active-courses/${id}/certificates`);
    return response.data;
  },

  generateCertificate: async (id, candidateId) => {
    const response = await api.post(
      `/active-courses/${id}/certificates/generate`,
      { candidateId },
    );
    return response.data;
  },

  updateCertificateActive: async (id, candidateId, value) => {
    const response = await api.put(
      `/active-courses/${id}/certificates/active`,
      { candidateId, value },
    );
    return response.data;
  },

  updateCertificateHide: async (id, certificateId, value) => {
    const response = await api.put(
      `/active-courses/${id}/certificates/${certificateId}/hide`,
      { value },
    );
    return response.data;
  },
};

export default activeCourseService;
