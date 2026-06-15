import { debounce } from "lodash";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Check, Search, ShieldAlert, UserX, X } from "lucide-react";
import { toast } from "sonner";
import BackButton from "../../components/common/BackButton";
import Meta from "../../components/common/Meta";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import TablePagination from "../../components/ui/TablePagination";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { formatDate } from "../../lib/utils/dateUtils";
import preActiveCourseService from "../../services/preActiveCourseService";

const ADMIN_STATUS_OPTIONS = [
  { value: "", label: "All admin statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const getStatusClassName = (status) => {
  if (status === "Approved") return "bg-blue-100 text-blue-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClassName(status)}`}
  >
    {status || "Pending"}
  </span>
);

const ActionModal = ({
  isOpen,
  actionStatus,
  candidate,
  adminRemark,
  actionLoading,
  onClose,
  onRemarkChange,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isApproval = actionStatus === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">
            Confirm Admin {actionStatus}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div
            className={`p-4 rounded-md ${isApproval ? "bg-green-50" : "bg-red-50"
              } flex items-start gap-3`}
          >
            <ShieldAlert
              className={`h-5 w-5 ${isApproval ? "text-green-600" : "text-red-600"
                } mt-0.5 flex-shrink-0`}
            />
            <div>
              <h4
                className={`text-sm font-medium ${isApproval ? "text-green-800" : "text-red-800"
                  }`}
              >
                Candidate: {candidate?.first_name} {candidate?.last_name || ""}
              </h4>
              <p
                className={`mt-1 text-sm ${isApproval ? "text-green-700" : "text-red-700"
                  }`}
              >
                You are about to {actionStatus.toLowerCase()} this rejected
                candidate nomination.
              </p>
            </div>
          </div>

          <Input
            label={`Admin Remark ${actionStatus === "Rejected" ? "(Required)" : "(Optional)"}`}
            value={adminRemark}
            onChange={(event) => onRemarkChange(event.target.value)}
            placeholder="Add reason for approval / rejection"
            required={actionStatus === "Rejected"}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={isApproval ? "primary" : "danger"}
              onClick={onConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : `Confirm ${actionStatus}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectedCandidateApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
  const [adminStatus, setAdminStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    data: null,
    status: "",
  });
  const [adminRemark, setAdminRemark] = useState("");

  const { hasPermission } = useAuth();
  const canEditApproval = hasPermission("edit_pre_active_approval");

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const response =
        await preActiveCourseService.getRejectedCandidateApprovals({
          page: currentPage,
          limit,
          search: debouncedSearch,
          admin_status: adminStatus,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
      setApprovals(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to load candidate declined requests"),
      );
    } finally {
      setLoading(false);
    }
  }, [adminStatus, currentPage, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [adminStatus, debouncedSearch]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleActionClick = (candidate, status) => {
    setActionModal({ isOpen: true, data: candidate, status });
    setAdminRemark("");
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, data: null, status: "" });
    setAdminRemark("");
  };

  const confirmAction = async () => {
    if (actionModal.status === "Rejected" && !adminRemark.trim()) {
      toast.error("Admin remark is mandatory for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      await preActiveCourseService.adminApproval(actionModal.data.id, {
        status: actionModal.status,
        remark: adminRemark.trim(),
      });
      toast.success(`Candidate ${actionModal.status} successfully.`);
      closeActionModal();
      fetchApprovals();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          `Failed to ${actionModal.status.toLowerCase()} candidate`,
        ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "course_name",
      label: "Course",
      sortable: true,
      className: "min-w-[220px]",
      render: (value, row) => (
        <div>
          <div className="font-semibold text-slate-800">{value || "-"}</div>
          <div className="text-xs text-slate-500 font-mono">
            {row.course_code || row.course_id || "-"}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {formatDate(row.start_date)} - {formatDate(row.end_date)}
          </div>
        </div>
      ),
    },
    {
      key: "candidate_name",
      label: "Candidate",
      sortable: true,
      className: "min-w-[190px]",
      render: (_value, row) => (
        <div>
          <div className="font-medium text-slate-900">
            {row.first_name} {row.last_name || ""}
          </div>
          <div className="text-xs text-slate-500">{row.email}</div>
          <div className="text-xs text-slate-400">
            {row.indos_number || "No INDOS"}
          </div>
        </div>
      ),
    },
    {
      key: "nominator_name",
      label: "Nominator",
      className: "min-w-[150px]",
      render: (value) => value || "N/A",
    },
    {
      key: "previous_certificate_date",
      label: "Certificate Date",
      align: "center",
      render: (value) => formatDate(value),
    },
    {
      key: "rejection_reason",
      label: "Rejection Reason",
      sortable: true,
      className: "min-w-[150px]",
      render: (_value, row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          {row.candidate_rejection_reason || "Rejected"}
        </span>
      ),
    },
    {
      key: "available_date",
      label: "Available Date",
      sortable: true,
      align: "center",
      render: (_value, row) =>
        row.candidate_rejection_reason === "Not Available"
          ? formatDate(row.candidate_available_date)
          : "-",
    },
    {
      key: "candidate_remark",
      label: "Candidate Remark",
      className: "min-w-[220px] max-w-[260px]",
      render: (value) => (
        <div className="truncate text-slate-500" title={value}>
          {value || "-"}
        </div>
      ),
    },
    {
      key: "admin_status",
      label: "Admin Status",
      sortable: true,
      align: "center",
      render: (_value, row) => (
        <StatusBadge status={row.admin_approval_status || "Pending"} />
      ),
    },
    {
      key: "admin_action_date",
      label: "Admin Action",
      sortable: true,
      className: "min-w-[180px]",
      render: (_value, row) => (
        <div>
          <div className="text-xs text-slate-600">
            {formatDate(row.admin_action_date)}
          </div>
          <div
            className="max-w-[180px] truncate text-xs text-slate-400"
            title={row.admin_remark}
          >
            {row.admin_remark || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_value, row) => {
        if (!canEditApproval || row.admin_approval_status !== "Pending") {
          return (
            <span className="text-xs text-slate-400 font-medium">
              {row.admin_approval_status === "Pending"
                ? "No permission"
                : "Processed"}
            </span>
          );
        }

        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick(row, "Approved")}
              className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionClick(row, "Rejected")}
              className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full pb-8">
      <Meta
        title="Candidate Declined Requests"
        description="Review rejected pre-active candidate approvals"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <BackButton to="/pre-active-courses" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-xl shadow-inner">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
              Candidate Declined Requests
            </h1>
            <p className="text-slate-500 mt-1">
              Review candidate rejections across pre-active courses
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10 border">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, candidate, nominator..."
              className="w-full h-11 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto sm:items-center">
            <select
              value={adminStatus}
              onChange={(event) => setAdminStatus(event.target.value)}
              className="h-11 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
            >
              {ADMIN_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {totalCount} Record{totalCount !== 1 ? "s" : ""} found
            </span>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={approvals}
        loading={loading}
        emptyMessage="No candidate Declined Requests found."
        currentPage={currentPage}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {!loading && approvals.length > 0 && (
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

      <ActionModal
        isOpen={actionModal.isOpen}
        actionStatus={actionModal.status}
        candidate={actionModal.data}
        adminRemark={adminRemark}
        actionLoading={actionLoading}
        onClose={closeActionModal}
        onRemarkChange={setAdminRemark}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default RejectedCandidateApprovals;
