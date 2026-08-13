import api from "../lib/api";

const generateQuestions = async (payload) => {
  const response = await api.post("/ai/generate-questions", payload);
  return response.data;
};

const aiQuestionService = {
  generateQuestions,
};

export default aiQuestionService;
