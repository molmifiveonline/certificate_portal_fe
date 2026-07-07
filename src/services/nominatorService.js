import api from "../lib/api";

const getAllNominators = async (params = {}) => {
  const response = await api.get("/nominators", { params });
  return response.data;
};

const getNominatorById = async (id) => {
  const response = await api.get(`/nominators/${id}`);
  return response.data;
};

const createNominator = async (nominatorData) => {
  const response = await api.post("/nominators/create", nominatorData);
  return response.data;
};

const updateNominator = async (id, nominatorData) => {
  const response = await api.put(`/nominators/update/${id}`, nominatorData);
  return response.data;
};

const deleteNominator = async (id) => {
  const response = await api.delete(`/nominators/delete/${id}`);
  return response.data;
};

const nominatorService = {
  getAllNominators,
  getNominatorById,
  createNominator,
  updateNominator,
  deleteNominator,
};

export default nominatorService;
