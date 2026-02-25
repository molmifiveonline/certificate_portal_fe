import api from "../lib/api";

const getQuestions = async (search = "", page = 1, limit = 10) => {
  const params = { search, page, limit };
  const response = await api.get("/question-bank", { params });
  return response.data;
};

const getQuestionById = async (id) => {
  const response = await api.get(`/question-bank/${id}`);
  return response.data;
};

const createQuestion = async (formData) => {
  const response = await api.post("/question-bank/create", formData, {
    headers: {
      "Content-Type": undefined, // Let axios set multipart/form-data with boundary automatically
    },
  });
  return response.data;
};

const updateQuestion = async (id, formData) => {
  const response = await api.put(`/question-bank/update/${id}`, formData, {
    headers: {
      "Content-Type": undefined, // Let axios set multipart/form-data with boundary automatically
    },
  });
  return response.data;
};

const deleteQuestion = async (id) => {
  const response = await api.delete(`/question-bank/delete/${id}`);
  return response.data;
};

const bulkUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/question-bank/bulk-upload", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });
  return response.data;
};

const downloadTemplate = async () => {
  const response = await api.get("/question-bank/sample-template", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "question_bank_template.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const questionBankService = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUpload,
  downloadTemplate,
};

export default questionBankService;
