import React, { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
  MapPin,
  UserCheck,
  Building,
  Loader2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import Meta from "../../components/common/Meta";
import { toast } from "sonner";
import { Card, CardContent } from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { formatDate } from "../../lib/utils/dateUtils";
import preActiveCourseService from "../../services/preActiveCourseService";
import { CANDIDATE_REJECTION_REASONS } from "../../lib/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";

const CandidateNominations = () => {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [approveModal, setApproveModal] = useState({
    isOpen: false,
    enrollment: null,
    remark: "",
    submitting: false,
  });

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    enrollment: null,
    reason: "",
    remark: "",
    availableDate: "",
    submitting: false,
  });

  const fetchNominations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await preActiveCourseService.getCandidateNominations();
      setNominations(res.data || []);
    } catch (error) {
      console.error("Error fetching nominations:", error);
      toast.error(getErrorMessage(error, "Failed to load nominations"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNominations();
  }, [fetchNominations]);

  const pendingCount = nominations.filter(
    (n) => (n.candidate_approval_status || "Pending") === "Pending",
  ).length;

  const handleOpenApprove = (enrollment) => {
    setApproveModal({
      isOpen: true,
      enrollment,
      remark: "",
      submitting: false,
    });
  };

  const handleCloseApprove = () => {
    setApproveModal({
      isOpen: false,
      enrollment: null,
      remark: "",
      submitting: false,
    });
  };

  const handleSubmitApprove = async (e) => {
    e.preventDefault();
    if (!approveModal.enrollment) return;

    try {
      setApproveModal((prev) => ({ ...prev, submitting: true }));
      await preActiveCourseService.submitCandidateNominationDecision(
        approveModal.enrollment.enrollment_id,
        {
          status: "Approved",
          remark: approveModal.remark.trim() || undefined,
        },
      );
      toast.success("Nomination approved successfully!");
      handleCloseApprove();
      fetchNominations();
    } catch (error) {
      console.error("Error approving nomination:", error);
      toast.error(getErrorMessage(error, "Failed to approve nomination"));
      setApproveModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleOpenReject = (enrollment) => {
    setRejectModal({
      isOpen: true,
      enrollment,
      reason: "",
      remark: "",
      availableDate: "",
      submitting: false,
    });
  };

  const handleCloseReject = () => {
    setRejectModal({
      isOpen: false,
      enrollment: null,
      reason: "",
      remark: "",
      availableDate: "",
      submitting: false,
    });
  };

  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.enrollment) return;

    if (!rejectModal.reason) {
      toast.error("Please select a reason for declining.");
      return;
    }

    if (!rejectModal.remark.trim()) {
      toast.error("Please provide remarks for declining.");
      return;
    }

    if (rejectModal.reason === "Not Available" && !rejectModal.availableDate) {
      toast.error("Please select your next available date.");
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, submitting: true }));
      await preActiveCourseService.submitCandidateNominationDecision(
        rejectModal.enrollment.enrollment_id,
        {
          status: "Rejected",
          rejection_reason: rejectModal.reason,
          remark: rejectModal.remark.trim(),
          available_date:
            rejectModal.reason === "Not Available"
              ? rejectModal.availableDate
              : undefined,
        },
      );
      toast.success("Nomination declined successfully.");
      handleCloseReject();
      fetchNominations();
    } catch (error) {
      console.error("Error declining nomination:", error);
      toast.error(getErrorMessage(error, "Failed to decline nomination"));
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border shadow-none px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 border shadow-none px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 border shadow-none px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 w-fit animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            Action Required
          </Badge>
        );
    }
  };

  const filteredNominations = nominations.filter((item) => {
    const status = item.candidate_approval_status || "Pending";
    if (statusFilter !== "All" && status !== statusFilter) {
      return false;
    }

    const searchStr = searchTerm.toLowerCase();
    return (
      item.course_name?.toLowerCase().includes(searchStr) ||
      item.course_code?.toLowerCase().includes(searchStr) ||
      item.topic?.toLowerCase().includes(searchStr) ||
      item.nominated_by?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredNominations.length / limit);
  const paginatedNominations = filteredNominations.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const columns = [
    {
      key: "course",
      label: "Course Details",
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 text-sm">
            {row.course_name || row.topic}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {row.course_code || "N/A"}
            </span>
            {row.type_of_course && (
              <span className="text-slate-400">• {row.type_of_course}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      label: "Schedule & Location",
      render: (_, row) => (
        <div className="flex flex-col text-xs text-slate-600 gap-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {formatDate(row.start_date)} - {formatDate(row.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            {row.days && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{row.days} Days</span>
              </div>
            )}
            {(row.location_name || row.type_of_location) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{row.location_name || row.type_of_location}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "nominator",
      label: "Nominated By",
      render: (_, row) => (
        <div className="flex flex-col text-xs text-slate-700">
          <span className="font-medium">{row.nominated_by || "Admin"}</span>
          <span className="text-[11px] text-slate-400">
            {row.nominated_at ? formatDate(row.nominated_at) : "Recent"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Your Response",
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(row.candidate_approval_status || "Pending")}
          {row.candidate_remark && (
            <div className="text-[11px] text-slate-500 italic max-w-[200px] truncate" title={row.candidate_remark}>
              Remark: {row.candidate_remark}
            </div>
          )}
          {row.candidate_rejection_reason && (
            <div className="text-[11px] text-rose-500 font-medium">
              Reason: {row.candidate_rejection_reason}
              {row.candidate_available_date && (
                <span className="block text-[10px] text-slate-400">
                  Avail: {formatDate(row.candidate_available_date)}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => {
        const isPending = (row.candidate_approval_status || "Pending") === "Pending";
        if (!isPending) {
          return (
            <span className="text-xs text-slate-400 font-medium">
              Submitted
            </span>
          );
        }

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={() => handleOpenApprove(row)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs flex items-center gap-1 rounded-lg shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenReject(row)}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 h-8 px-3 text-xs flex items-center gap-1 rounded-lg shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in duration-500">
      <Meta
        title="Course Nominations"
        description="Review and respond to course nominations"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <UserCheck className="w-7 h-7" />
            </div>
            Course Nominations
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review your nominations to attend upcoming training courses and provide your decision.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>
              <strong>{pendingCount}</strong> pending nomination{pendingCount > 1 ? "s" : ""} waiting for your response
            </span>
          </div>
        )}
      </div>

      {/* Filters & Search Card */}
      <Card className="rounded-2xl border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl w-full md:w-auto overflow-x-auto">
            {["All", "Pending", "Approved", "Rejected"].map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "Rejected" ? "Declined" : tab}
                  {tab === "Pending" && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course or nominator..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table & Content */}
      {paginatedNominations.length === 0 && !loading ? (
        <Card className="bg-white border border-dashed border-slate-200 rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl mb-3 text-slate-300">
              <CheckCircle2 className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No nominations found
            </h3>
            <p className="text-slate-500 max-w-sm mt-1 text-xs">
              {statusFilter === "Pending"
                ? "You have no pending course nominations to review at this moment."
                : "No course nominations match your current filter criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={paginatedNominations}
            loading={loading}
            emptyMessage="No nominations found."
            currentPage={currentPage}
            limit={limit}
          />

          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Approve Course Nomination
              </h3>
              <button
                onClick={handleCloseApprove}
                disabled={approveModal.submitting}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApprove} className="p-5 space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-800 space-y-1">
                <p className="font-semibold text-emerald-900 text-sm">
                  {approveModal.enrollment?.course_name ||
                    approveModal.enrollment?.topic}
                </p>
                <p className="text-emerald-700">
                  Schedule: {formatDate(approveModal.enrollment?.start_date)} -{" "}
                  {formatDate(approveModal.enrollment?.end_date)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Remarks / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Add any comments or confirmation details..."
                  className="w-full text-xs min-h-[80px]"
                  value={approveModal.remark}
                  onChange={(e) =>
                    setApproveModal((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseApprove}
                  disabled={approveModal.submitting}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={approveModal.submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  {approveModal.submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Confirm Approval
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                  <XCircle className="w-5 h-5" />
                </div>
                Decline Course Nomination
              </h3>
              <button
                onClick={handleCloseReject}
                disabled={rejectModal.submitting}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="p-5 space-y-4">
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-800 space-y-1">
                <p className="font-semibold text-rose-900 text-sm">
                  {rejectModal.enrollment?.course_name ||
                    rejectModal.enrollment?.topic}
                </p>
                <p className="text-rose-700">
                  Schedule: {formatDate(rejectModal.enrollment?.start_date)} -{" "}
                  {formatDate(rejectModal.enrollment?.end_date)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason for Declining <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={rejectModal.reason}
                  onValueChange={(val) =>
                    setRejectModal((prev) => ({ ...prev, reason: val }))
                  }
                >
                  <SelectTrigger className="w-full text-xs h-10 rounded-xl">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_REJECTION_REASONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {rejectModal.reason === "Not Available" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Next Available Date <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={rejectModal.availableDate}
                    onChange={(e) =>
                      setRejectModal((prev) => ({
                        ...prev,
                        availableDate: e.target.value,
                      }))
                    }
                    className="w-full text-xs h-10 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Remarks / Explanation <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Please state why you are unable to attend..."
                  className="w-full text-xs min-h-[80px] rounded-xl"
                  value={rejectModal.remark}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseReject}
                  disabled={rejectModal.submitting}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rejectModal.submitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  {rejectModal.submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Confirm Decline
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateNominations;
