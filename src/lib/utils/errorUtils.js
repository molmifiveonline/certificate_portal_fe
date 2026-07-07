export const getErrorMessage = (error, fallback = "An unexpected error occurred") => {
  return error?.response?.data?.message || error?.message || fallback;
};
