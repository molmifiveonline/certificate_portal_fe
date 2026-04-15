import React, { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../lib/utils/errorUtils";
import { Eye, ReceiptText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../../components/common/Meta";
import PageHeader from "../../../components/common/PageHeader";
import { Card, CardContent } from "../../../components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import DataTable from "../../../components/ui/DataTable";
import TablePagination from "../../../components/ui/TablePagination";
import reimbursementService from "../../../services/reimbursementService";
import { formatDate } from "../../../lib/utils/dateUtils";
import ReimbursementStatusBadge from "../../../components/reimbursements/ReimbursementStatusBadge";

const statusFilters = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "resubmission_requested", label: "Resubmission Requested" },
  { value: "resubmitted", label: "Resubmitted" },
  { value: "approved", label: "Approved" },
  { value: "disapproved", label: "Disapproved" },
];

const normalizeListResponse = (response) => ({
  rows: response?.data || response?.rows || [],
  total: response?.total || response?.meta?.total || 0,
});

const ReimbursementAdminList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reimbursementService.getAdminReimbursements({
        page,
        limit,
        search,
        status: status === "all" ? undefined : status,
      });
      const { rows: data, total } = normalizeListResponse(response);
      setRows(data);
      setTotalCount(total || data.length);
    } catch (error) {
      console.error("Failed to load reimbursements:", error);
      toast.error(getErrorMessage(error, "Failed to load reimbursement claims"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns = [
    {
      key: "claim_number",
      label: "Claim",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">
            {value || row.id}
          </span>
          <span className="text-xs text-slate-400">
            {row.candidate_name || row.candidate_email || "Candidate"}
          </span>
        </div>
      ),
    },
    {
      key: "active_course_name",
      label: "Active Course",
      render: (_, row) => row.active_course_name || row.course_name || "-",
    },
    {
      key: "claim_date",
      label: "Date",
      render: (value) => formatDate(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <ReimbursementStatusBadge status={value} />,
    },
    {
      key: "open",
      label: "Open",
      align: "center",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/reimbursements/${row.id}`)}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <Meta
        title="Admin Reimbursements"
        description="Review reimbursement claims"
      />

      <PageHeader
        title="Reimbursements"
        subtitle="Review claims, request corrections, and send approved claims forward."
        icon={ReceiptText}
      />

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by claim no., candidate, or course"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-400"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage="No reimbursement claims found."
          currentPage={page}
          limit={limit}
        />

        <TablePagination
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(totalCount / limit))}
          totalCount={totalCount}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
};

export default ReimbursementAdminList;


