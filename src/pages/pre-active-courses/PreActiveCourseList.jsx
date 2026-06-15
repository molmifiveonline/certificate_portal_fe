import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Send,
  CheckCircle,
  RefreshCw,
  Calendar,
  BookOpen,
  Zap,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Button } from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useAuth } from "../../context/AuthContext";
import Meta from "../../components/common/Meta";
import CourseImportPreviewModal from "../../components/pre-active-courses/CourseImportPreviewModal";
import { Card, CardContent } from "../../components/ui/Card";
import { formatDate } from "../../lib/utils/dateUtils";

const getCourseType = (course) =>
  course?.course_type || course?.type_of_course || course?.type || "";

const getConversionTargetLabel = (course) => {
  const normalizedType = getCourseType(course)
    .toLowerCase()
    .replace(/\s+/g, "");
  return normalizedType === "outhouse" ? "Outhouse Course" : "Active Course";
};

const getConvertedCoursePath = (course) => {
  const targetId =
    course?.converted_course_id ||
    course?.target_course_id ||
    course?.active_course_id ||
    course?.outhouse_course_id;

  if (!targetId) return null;

  return getConversionTargetLabel(course) === "Outhouse Course"
    ? `/outhouse-courses/edit/${targetId}`
    : `/active-courses/edit/${targetId}`;
};

const getPendingApprovalCount = (course) => {
  const possibleCounts = [
    course?.pending_approvals,
    course?.pending_approval_count,
    course?.pending_admin_approvals,
    course?.pending_admin_approval_count,
    course?.pending_candidate_approvals,
    course?.pending_candidate_approval_count,
  ];

  return possibleCounts.reduce((total, value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? total + parsed : total;
  }, 0);
};

const hasKnownPendingApprovals = (course) =>
  Boolean(course?.has_pending_approvals) || getPendingApprovalCount(course) > 0;

const isConvertedCourse = (course) => {
  const status = String(course?.status || course?.lifecycle_status || "")
    .toLowerCase()
    .trim();

  return (
    status === "closed" ||
    status === "converted" ||
    Boolean(getConvertedCoursePath(course))
  );
};

const getCloseAvailability = (course) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDateLine = new Date(course.start_date);
  startDateLine.setHours(0, 0, 0, 0);
  startDateLine.setDate(startDateLine.getDate() - 1);

  if (Number.isNaN(startDateLine.getTime())) {
    return {
      disabled: true,
      reason: "Cannot close: Start date is missing or invalid.",
    };
  }

  if (isConvertedCourse(course)) {
    return {
      disabled: true,
      reason: "This pre-active course is already closed or converted.",
    };
  }

  if (today > startDateLine) {
    return {
      disabled: true,
      reason: "Cannot close: Deadline (1 day prior to start date) has passed.",
    };
  }

  if (hasKnownPendingApprovals(course)) {
    return {
      disabled: true,
      reason: "Cannot close: Candidate or admin approvals are still pending.",
    };
  }

  return {
    disabled: false,
    reason: `Close and convert to ${getConversionTargetLabel(course)}`,
  };
};

const PreActiveCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("start_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [courseToNotify, setCourseToNotify] = useState(null);
  const [notifyType, setNotifyType] = useState(""); // 'nominator' or 'candidate'
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [courseToConvert, setCourseToConvert] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { hasPermission, isRestrictedAdmin } = useAuth();
  const canCreateCourse =
    !isRestrictedAdmin && hasPermission("create_pre_active_course");
  const canNotifyNominators =
    !isRestrictedAdmin &&
    (hasPermission("edit_pre_active_course") ||
      hasPermission("view_pre_active_courses"));
  const canNotifyCandidates =
    !isRestrictedAdmin && hasPermission("edit_pre_active_course");
  const canViewApprovals =
    !isRestrictedAdmin && hasPermission("view_pre_active_approvals");
  const canConvertCourse =
    !isRestrictedAdmin && hasPermission("edit_pre_active_course");
  const canEditCourse =
    !isRestrictedAdmin && hasPermission("edit_pre_active_course");
  const canDeleteCourse =
    !isRestrictedAdmin && hasPermission("delete_pre_active_course");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await preActiveCourseService.getAll({
        page: currentPage,
        limit,
        search: debouncedSearch,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setCourses(response.data || []);
      if (response.meta) {
        setTotalPages(response.meta.totalPages);
        setTotalCount(response.meta.total || 0);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch pre-active courses"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsActionLoading(true);
      await preActiveCourseService.delete(courseToDelete.id);
      toast.success("Pre-Active course deleted successfully");
      setDeleteModalOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete course"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNotifyClick = (course, type) => {
    setCourseToNotify(course);
    setNotifyType(type);
    setNotifyModalOpen(true);
  };

  const handleConfirmNotify = async () => {
    try {
      setIsActionLoading(true);
      if (notifyType === "nominator") {
        const res = await preActiveCourseService.notifyNominators(
          courseToNotify.id,
        );
        toast.success(res.message || "Emails sent to nominators");
      } else if (notifyType === "candidate") {
        const res = await preActiveCourseService.notifyCandidates(
          courseToNotify.id,
        );
        toast.success(res.message || "Candidate approval emails resent");
      }
      setNotifyModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to notify ${notifyType}s`));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConvertClick = (course) => {
    setCourseToConvert(course);
    setConvertModalOpen(true);
  };

  const handleConfirmConvert = async () => {
    try {
      setIsActionLoading(true);
      const response = await preActiveCourseService.closeAndConvert(
        courseToConvert.id,
      );
      const targetLabel =
        response?.target_type ||
        response?.targetType ||
        getConversionTargetLabel(courseToConvert);
      toast.success(
        response?.message || `Closed and converted to ${targetLabel}`,
      );
      setConvertModalOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to close and convert course"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "course_id",
      label: "Course ID",
      sortable: true,
      render: (val) => (
        <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded w-fit border border-blue-100/50">
          {val}
        </div>
      ),
    },
    {
      key: "course_name",
      label: "Course Details",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800">{val}</div>
          <div className="text-xs text-slate-500 capitalize flex items-center gap-1 mt-0.5">
            <BookOpen size={10} className="text-slate-400" />
            {row.topic}
          </div>
        </div>
      ),
    },
    {
      key: "start_date",
      label: "Schedule",
      sortable: true,
      align: "center",
      render: (val, row) => (
        <div className="inline-flex flex-col items-center gap-1 text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl text-xs font-medium min-w-[160px]">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-blue-500" />
            <span>
              {formatDate(row.start_date)} - {formatDate(row.end_date)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_val, row) => {
        const actionItems = [];

        if (canNotifyNominators) {
          actionItems.push(
            <Button
              key="notify-nominators"
              variant="ghost"
              size="sm"
              onClick={() => handleNotifyClick(row, "nominator")}
              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Notify Nominators"
            >
              <Mail className="h-4 w-4" />
            </Button>,
          );
        }

        if (canNotifyCandidates) {
          actionItems.push(
            <Button
              key="notify-candidates"
              variant="ghost"
              size="sm"
              onClick={() => handleNotifyClick(row, "candidate")}
              className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 rounded-lg"
              title="Resend Candidate Approval Emails"
            >
              <Send className="h-4 w-4" />
            </Button>,
          );
        }

        if (canViewApprovals) {
          actionItems.push(
            <Link
              key="approvals"
              to={`/pre-active-courses/${row.id}/approvals`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 rounded-lg"
                title="View Candidates & Approvals"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </Link>,
          );
        }

        if (canConvertCourse) {
          const closeAvailability = getCloseAvailability(row);
          const convertedCoursePath = getConvertedCoursePath(row);

          if (convertedCoursePath) {
            actionItems.push(
              <Link key="converted-course" to={convertedCoursePath}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 gap-1.5 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-green-200 text-green-600 hover:bg-green-50"
                  title={`Open converted ${getConversionTargetLabel(row)}`}
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Converted</span>
                </Button>
              </Link>,
            );
          } else {
            actionItems.push(
              <Button
                key="close-convert"
                variant="outline"
                size="sm"
                disabled={closeAvailability.disabled}
                onClick={() => handleConvertClick(row)}
                className={`h-8 px-2 gap-1.5 font-bold text-[10px] uppercase tracking-wider rounded-lg border ${
                  closeAvailability.disabled
                    ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                    : "border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
                title={closeAvailability.reason}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Close & Convert</span>
              </Button>,
            );
          }
        }

        if (isRestrictedAdmin) {
          actionItems.push(
            <Button
              key="nominate"
              variant="primary"
              size="sm"
              onClick={async () => {
                try {
                  setIsActionLoading(true);
                  const { token } =
                    await preActiveCourseService.getNominatorToken(row.id);
                  window.open(`/nominate/${token}`, "_blank");
                } catch (error) {
                  toast.error(
                    getErrorMessage(
                      error,
                      "Failed to access nomination portal",
                    ),
                  );
                } finally {
                  setIsActionLoading(false);
                }
              }}
              className="h-8 px-2 bg-blue-600 text-white hover:bg-blue-700 gap-1.5 font-bold text-[10px] uppercase tracking-wider rounded-lg"
              title="Nominate Candidates"
            >
              <Plus className="h-3 w-3" />
              <span>Nominate</span>
            </Button>,
          );
        }

        if (canEditCourse || canDeleteCourse) {
          actionItems.push(
            <div
              key="divider"
              className="w-px h-6 bg-slate-200 mx-1 self-center"
            />,
          );
        }

        if (canEditCourse) {
          actionItems.push(
            <Link key="edit" to={`/pre-active-courses/edit/${row.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>,
          );
        }

        if (canDeleteCourse) {
          actionItems.push(
            <Button
              key="delete"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              onClick={() => handleDeleteClick(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>,
          );
        }

        if (actionItems.length === 0) {
          return <span className="text-xs text-slate-400">No actions</span>;
        }

        return <div className="flex justify-end gap-1.5">{actionItems}</div>;
      },
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full pb-8">
      <Meta
        title="Pre-Active Courses"
        description="Manage courses before they become active"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl shadow-inner">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            Pre-Active Courses
          </h1>
          <p className="text-slate-500 mt-1">
            Manage courses before they become active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreateCourse && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(true)}
                className="h-11 px-6 rounded-xl border bg-white/60 backdrop-blur-md shadow-sm hover:bg-white text-slate-700 font-bold flex items-center gap-2 active:scale-95 transition-all"
                style={{ borderColor: "rgb(49 46 129 / 90%)" }}
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Sync API
              </Button>
              <Link to="/pre-active-courses/add">
                <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Pre-Active Course
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-2xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10 border">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or ID..."
              className="w-full h-11 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {totalCount} Record{totalCount !== 1 ? "s" : ""} found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        emptyMessage="No pre-active courses found."
        currentPage={currentPage}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {!loading && courses.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pre-Active Course"
        message={`Are you sure you want to delete the course "${courseToDelete?.course_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isActionLoading}
      />

      <ConfirmationModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        onConfirm={handleConfirmNotify}
        title={
          notifyType === "nominator"
            ? "Notify Nominators"
            : "Resend Candidate Approval Emails"
        }
        message={`Are you sure you want to ${notifyType === "nominator" ? "send email notifications to all nominators" : "resend approval emails to pending candidates"} for "${courseToNotify?.course_name}"?`}
        confirmText="Send Emails"
        variant="primary"
        isLoading={isActionLoading}
      />

      <ConfirmationModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        onConfirm={handleConfirmConvert}
        title="Close & Convert Pre-Active Course"
        message={`Are you sure you want to close "${courseToConvert?.course_name}" and convert it to a ${getConversionTargetLabel(courseToConvert)}? This action cannot be reversed.`}
        confirmText="Close & Convert"
        variant="primary"
        isLoading={isActionLoading}
      />

      <CourseImportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onImportSuccess={fetchCourses}
      />
    </div>
  );
};

export default PreActiveCourseList;
