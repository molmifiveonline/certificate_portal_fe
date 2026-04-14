export const normalizeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const buildCandidateFullName = (candidate) =>
  [candidate?.first_name, candidate?.middle_name, candidate?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

export const buildLoggedInCandidateIdentity = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user?.candidate_id || user?.candidateId || user?.id || null,
    email: user?.email || "",
    employee_id: user?.employee_id || user?.employeeId || user?.empId || "",
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    name:
      user?.name ||
      [user?.first_name, user?.middle_name, user?.last_name].filter(Boolean).join(" "),
  };
};

export const resolveLoggedInCandidate = (user, candidates = []) => {
  if (!user || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const userCandidateId = user?.candidate_id || user?.candidateId;
  const userId = user?.id;
  const userEmail = normalizeValue(user?.email);
  const userEmployeeId = normalizeValue(user?.employee_id || user?.employeeId || user?.empId);
  const userName = normalizeValue(
    user?.name ||
      [user?.first_name, user?.middle_name, user?.last_name].filter(Boolean).join(" "),
  );

  return (
    candidates.find((candidate) => String(candidate?.id) === String(userCandidateId)) ||
    candidates.find((candidate) => String(candidate?.id) === String(userId)) ||
    candidates.find((candidate) => normalizeValue(candidate?.email) === userEmail) ||
    candidates.find(
      (candidate) =>
        normalizeValue(candidate?.employee_id || candidate?.employeeId || candidate?.empId) ===
        userEmployeeId,
    ) ||
    candidates.find(
      (candidate) => normalizeValue(buildCandidateFullName(candidate)) === userName,
    ) ||
    null
  );
};

export const isCertificateOwnedByCandidate = (certificate, candidate, user) => {
  if (!certificate) {
    return false;
  }

  const certificateCandidateId = certificate?.candidate_id || certificate?.candidateId;
  const certificateEmail = normalizeValue(certificate?.email);
  const certificateEmployeeId = normalizeValue(
    certificate?.employee_id || certificate?.employeeId || certificate?.empId,
  );
  const certificateCandidateName = normalizeValue(
    certificate?.candidate_name || certificate?.candidateName,
  );

  const candidateId = candidate?.id;
  const candidateEmail = normalizeValue(candidate?.email || user?.email);
  const candidateEmployeeId = normalizeValue(
    candidate?.employee_id ||
      candidate?.employeeId ||
      candidate?.empId ||
      user?.employee_id ||
      user?.employeeId ||
      user?.empId,
  );
  const candidateName = normalizeValue(
    buildCandidateFullName(candidate) ||
      user?.name ||
      [user?.first_name, user?.middle_name, user?.last_name].filter(Boolean).join(" "),
  );

  return (
    (candidateId && String(certificateCandidateId) === String(candidateId)) ||
    (candidateEmail && certificateEmail === candidateEmail) ||
    (candidateEmployeeId && certificateEmployeeId === candidateEmployeeId) ||
    (candidateName && certificateCandidateName === candidateName)
  );
};
