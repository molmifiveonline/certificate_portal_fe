import api from "../lib/api";

const submitFeedback = async (data) => {
  const response = await api.post("/feedback-answers/submit", data);
  return response.data;
};

const getSubmissions = async (params) => {
  const response = await api.get("/feedback-answers/submissions", { params });
  return response.data;
};

const getSubmissionDetails = async (candidateId, activeCourseId) => {
  const response = await api.get(
    `/feedback-answers/submissions/${candidateId}/${activeCourseId}`,
  );
  return response.data;
};

const getFeedbackCourses = async (params) => {
  const response = await api.get("/feedback-answers/courses", { params });
  return response.data;
};

const downloadPDF = async (candidateId, activeCourseId) => {
  const response = await api.get(
    `/feedback-answers/download-pdf/${candidateId}/${activeCourseId}`,
    { responseType: "blob" },
  );
  return response.data;
};

const feedbackAnswerService = {
  submitFeedback,
  getSubmissions,
  getSubmissionDetails,
  getFeedbackCourses,
  downloadPDF,
};

export default feedbackAnswerService;
