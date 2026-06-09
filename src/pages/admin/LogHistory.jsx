import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "sonner";
import { Search, History } from "lucide-react";
import api from "../../lib/api";
import logService from "../../services/logService";
import activeCourseService from "../../services/activeCourseService";
import assessmentService from "../../services/assessmentService";
import candidateService from "../../services/candidateService";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import feedbackFormService from "../../services/feedbackFormService";
import feedbackQuestionService from "../../services/feedbackQuestionService";
import hotelService from "../../services/hotelService";
import outhouseCourseService from "../../services/outhouseCourseService";
import preActiveCourseService from "../../services/preActiveCourseService";
import questionBankService from "../../services/questionBankService";
import nominatorService from "../../services/nominatorService";
import adminUserService from "../../services/adminUserService";
import locationService from "../../services/locationService";
import { systemManualService } from "../../services/systemManualService";
import reimbursementService from "../../services/reimbursementService";
import certificateService from "../../services/certificateService";
import Meta from "../../components/common/Meta";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { Card, CardContent } from "../../components/ui/Card";
import TablePagination from "../../components/ui/TablePagination";
import { formatDateTime } from "../../lib/utils/dateUtils";
import { debounce } from "lodash";

const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
const URL_PATTERN = /URL:\s*([^,]+)/i;

const buildMasterCourseName = (course) =>
  [course?.topic, course?.master_course_name].filter(Boolean).join(" - ") ||
  course?.master_course_name ||
  course?.topic ||
  null;

const buildCourseName = (course) =>
  course?.course_name ||
  course?.topic ||
  course?.master_course_name ||
  course?.course_id ||
  null;

const buildQuestionName = (question) => {
  const text =
    question?.question ||
    question?.title ||
    question?.name ||
    question?.question_text;

  if (!text) return null;
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
};

const buildSimpleName = (record) =>
  record?.name ||
  record?.title ||
  record?.form_name ||
  record?.question ||
  record?.question_text ||
  record?.venue_name ||
  record?.hotel_name ||
  record?.location_name ||
  null;

const buildCandidateName = (candidate) => {
  const fullName = [candidate?.first_name, candidate?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;
  if (candidate?.email) return candidate.email;
  return null;
};

const extractCandidateIdFromLog = (log) => {
  const details = log?.details || "";
  if (!details || !log?.action?.includes("CANDIDATE")) return null;

  const match = details.match(UUID_PATTERN);
  return match?.[0] || null;
};

const extractUrlFromDetails = (details) => details.match(URL_PATTERN)?.[1] || "";

const normalizeRouteParts = (details) => {
  const rawUrl = extractUrlFromDetails(details);
  if (!rawUrl) return [];

  return rawUrl
    .split("?")[0]
    .split("/")
    .filter(Boolean);
};

const extractResourceRefFromLog = (log) => {
  const details = log?.details || "";
  const candidateId = extractCandidateIdFromLog(log);

  if (candidateId) {
    return { moduleKey: "candidate", recordId: candidateId };
  }

  const parts = normalizeRouteParts(details);
  const apiIndex = parts.indexOf("api");
  if (apiIndex === -1 || apiIndex === parts.length - 1) return null;

  let moduleKey = parts[apiIndex + 1];
  
  // Handle nested routes like /api/admin/users or /api/admin/reimbursements
  if (moduleKey === "admin" && parts[apiIndex + 2]) {
    moduleKey = `admin/${parts[apiIndex + 2]}`;
  }

  const recordId = parts.find((part, index) => index > apiIndex + 1 && UUID_PATTERN.test(part));

  if (!moduleKey || !recordId) return null;

  return { moduleKey, recordId };
};

const getResourceCacheKey = ({ moduleKey, recordId }) => `${moduleKey}:${recordId}`;

const resolveResourceName = async ({ moduleKey, recordId }) => {
  switch (moduleKey) {
    case "candidate": {
      const candidate = await candidateService.getCandidateById(recordId);
      return buildCandidateName(candidate);
    }
    case "active-courses": {
      const course = await activeCourseService.getCourseById(recordId);
      return buildCourseName(course);
    }
    case "pre-active": {
      const course = await preActiveCourseService.getById(recordId);
      return buildCourseName(course);
    }
    case "outhouse-courses": {
      const course = await outhouseCourseService.getById(recordId);
      return buildCourseName(course);
    }
    case "master-courses": {
      const response = await api.get(`/master-courses/${recordId}`);
      return buildMasterCourseName(response.data);
    }
    case "question-bank": {
      const response = await questionBankService.getQuestionById(recordId);
      return buildQuestionName(response?.data);
    }
    case "assessment": {
      const response = await assessmentService.getAssessmentById(recordId);
      return buildSimpleName(response?.data);
    }
    case "feedback-categories": {
      const response = await feedbackCategoryService.getById(recordId);
      return buildSimpleName(response?.data || response);
    }
    case "feedback-forms": {
      const response = await feedbackFormService.getById(recordId);
      return buildSimpleName(response?.data || response);
    }
    case "feedback-questions": {
      const response = await feedbackQuestionService.getById(recordId);
      return buildQuestionName(response?.data || response);
    }
    case "hotel-details": {
      const response = await hotelService.getHotelById(recordId);
      return buildSimpleName(response?.data || response);
    }
    case "nominators": {
      const nominator = await nominatorService.getNominatorById(recordId);
      return nominator?.name || nominator?.email || null;
    }
    case "admin/users": {
      const admin = await adminUserService.getAdminById(recordId);
      return [admin?.first_name, admin?.last_name].filter(Boolean).join(" ") || admin?.email || null;
    }
    case "locations": {
      const location = await locationService.getLocationById(recordId);
      return location?.location_name || null;
    }
    case "system-manual": {
      const manual = await systemManualService.getSystemManualById(recordId);
      return manual?.title || null;
    }
    case "reimbursements":
    case "admin/reimbursements": {
      const reimbursement = await reimbursementService.getAdminReimbursementById(recordId);
      return reimbursement?.claim_number || null;
    }
    case "certificates": {
      const certificate = await certificateService.getCertificateById(recordId);
      return certificate?.certificate_no || null;
    }
    case "admin-roles": {
      const response = await api.get(`/admin-roles/${recordId}`);
      return response.data?.role_name || null;
    }
    default:
      return null;
  }
};

const formatLogDetails = (log, resolvedResourceNames) => {
  let details = log?.details || "-";
  const resourceRef = extractResourceRefFromLog(log);
  
  let targetName = null;
  if (resourceRef) {
    targetName = resolvedResourceNames[getResourceCacheKey(resourceRef)];
    if (targetName) {
      if (resourceRef.moduleKey === "candidate") {
        details = details.replace(
          /candidate ID:\s*[0-9a-f-]+/i,
          `Candidate: ${targetName}`
        );
      }
      details = details.replace(resourceRef.recordId, targetName);
    } else {
      targetName = resourceRef.recordId;
    }
  }

  // Check if it is an auto-generated log with Method, URL, Status
  const isAutoLog = /Method:\s+[A-Z]+,\s+URL:.+,\s+Status:\s+\d+/i.test(details);
  
  if (isAutoLog) {
    if (targetName) return targetName;
    
    // Fallback: Parse the Method and URL from details to generate a readable summary
    const parts = normalizeRouteParts(log.details);
    const apiIndex = parts.indexOf("api");
    if (apiIndex !== -1 && parts.length > apiIndex + 1) {
      let moduleName = parts[apiIndex + 1];
      moduleName = moduleName
        .split(/[- ]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      const methodMatch = log.details.match(/Method:\s*([A-Z]+)/i);
      const method = methodMatch ? methodMatch[1].toUpperCase() : "";
      let actionType = "Modified";
      if (method === "POST") actionType = "Created";
      else if (method === "DELETE") actionType = "Deleted";
      else if (method === "PUT" || method === "PATCH") actionType = "Updated";
 
      return `${actionType} ${moduleName}`;
    }
    
    return "-";
  }

  // For custom logs, just remove Method and URL keywords if they exist to keep it clean
  details = details.replace(/Method:\s*[A-Z]+,?\s*/i, "");
  details = details.replace(/URL:\s*[^,]+,?\s*/i, "");
  
  return details.replace(/^(,\s*)+|(,\s*)+$/g, "").trim() || "-";
};

const renderDateTime = (createdAt) => {
  if (!createdAt) return "-";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "-";

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d).toUpperCase();

  return (
    <div className="flex flex-col">
      <span className="text-slate-800 font-semibold">{dateStr}</span>
      <span className="text-xs text-slate-400 font-normal mt-0.5">{timeStr}</span>
    </div>
  );
};

const LogHistory = () => {
  const [logs, setLogs] = useState([]);
  const [resolvedResourceNames, setResolvedResourceNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  const updateDebouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(searchTerm);
  }, [searchTerm, updateDebouncedSearch]);

  const fetchLogs = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const response = await logService.getLogs({ page, limit, search });
      if (response.data && response.total !== undefined) {
        setLogs(response.data);
        setTotalLogs(response.total);
      } else if (response.data && response.meta) {
        setLogs(response.data);
        setTotalLogs(response.meta.total);
      } else {
        setLogs(Array.isArray(response) ? response : []);
        setTotalLogs(Array.isArray(response) ? response.length : 0);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error(getErrorMessage(error, "Failed to load log history"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, itemsPerPage, debouncedSearch);
  }, [currentPage, itemsPerPage, debouncedSearch, fetchLogs]);

  useEffect(() => {
    const unresolvedResources = [
      ...new Map(
        logs
          .map(extractResourceRefFromLog)
          .filter(Boolean)
          .map((resourceRef) => [getResourceCacheKey(resourceRef), resourceRef]),
      ).values(),
    ].filter(
      (resourceRef) =>
        !(getResourceCacheKey(resourceRef) in resolvedResourceNames),
    );

    if (unresolvedResources.length === 0) return;

    let isMounted = true;

    const loadResourceNames = async () => {
      const results = await Promise.allSettled(
        unresolvedResources.map((resourceRef) => resolveResourceName(resourceRef)),
      );

      if (!isMounted) return;

      setResolvedResourceNames((prev) => {
        const next = { ...prev };

        results.forEach((result, index) => {
          const resourceRef = unresolvedResources[index];
          next[getResourceCacheKey(resourceRef)] =
            result.status === "fulfilled" ? result.value : null;
        });

        return next;
      });
    };

    loadResourceNames();

    return () => {
      isMounted = false;
    };
  }, [logs, resolvedResourceNames]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;

    setIsDeleting(true);
    try {
      await logService.deleteLog(logToDelete);
      toast.success("Log deleted successfully");
      fetchLogs(currentPage, itemsPerPage, searchTerm);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete log:", error);
      toast.error(getErrorMessage(error, "Failed to delete log"));
    } finally {
      setIsDeleting(false);
      setLogToDelete(null);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  if (loading && logs.length === 0 && !searchTerm && !debouncedSearch) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-y-auto">
      <Meta title="Log History" description="View System Logs" />
      <PageHeader
        title="Log History"
        subtitle="View and manage system activity logs"
        icon={History}
      />

      <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, details, user..."
              className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl flex items-center gap-2 text-slate-500 text-sm font-medium">
              <History className="w-4 h-4" />
              <span>Total Logs: {totalLogs}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-indigo-900/90 text-white border-b border-white/10 backdrop-blur-md">
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                  User / Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-slate-600 max-w-md truncate"
                      title={formatLogDetails(log, resolvedResourceNames)}
                    >
                      {formatLogDetails(log, resolvedResourceNames)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-0.5">
                          {log.admin_role_name ||
                            (log.role_name === "superadmin"
                              ? "Super Admin"
                              : log.role_name === "admin"
                                ? "Admin"
                                : log.role_name ||
                                  (log.user_id ? "User" : "System"))}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {log.user_name ||
                            (log.user_id ? "Unknown User" : "System")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalLogs > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalLogs}
            limit={itemsPerPage}
            onLimitChange={handleLimitChange}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Log Entry"
        message="Are you sure you want to delete this log entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LogHistory;
