import api from "../lib/api";

const getAssessments = async (params = {}) => {
  const response = await api.get("/assessment", { params });
  return response.data;
};

const getAssessmentById = async (id) => {
  const response = await api.get(`/assessment/${id}`);
  return response.data;
};

const createAssessment = async (data) => {
  const response = await api.post("/assessment/create", data);
  return response.data;
};

const updateAssessment = async (id, data) => {
  const response = await api.put(`/assessment/update/${id}`, data);
  return response.data;
};

const deleteAssessment = async (id) => {
  const response = await api.delete(`/assessment/delete/${id}`);
  return response.data;
};

const getActiveCourses = async (typeOfTest = null) => {
  const params = typeOfTest ? { type_of_test: typeOfTest } : {};
  const response = await api.get("/assessment/courses", { params });
  return response.data;
};

const getCandidatesByCourse = async (courseId) => {
  const response = await api.get(`/assessment/candidates/${courseId}`);
  return response.data;
};

const getQuestionsByCourse = async (courseId, typeOfTest = null) => {
  const params = typeOfTest ? { type_of_test: typeOfTest } : {};
  const response = await api.get(`/assessment/questions/${courseId}`, {
    params,
  });
  return response.data;
};

// Submitted Assessment APIs
const getSubmittedCourses = async (params = {}) => {
  const response = await api.get("/assessment/submitted-courses", { params });
  return response.data;
};

const getCourseSubmissions = async (courseId, params = {}) => {
  const response = await api.get(`/assessment/course/${courseId}/submissions`, {
    params,
  });
  return response.data;
};

const getSubmissionDetail = async (resultId) => {
  const response = await api.get(`/assessment/submission/${resultId}`);
  return response.data;
};

const assessmentService = {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getActiveCourses,
  getCandidatesByCourse,
  getQuestionsByCourse,
  getSubmittedCourses,
  getCourseSubmissions,
  getSubmissionDetail,
};

export default assessmentService;
