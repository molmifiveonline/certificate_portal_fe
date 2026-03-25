import React, { useCallback, useEffect, useState } from "react";
import { Edit, Eye, Plus, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import reimbursementService from "../../services/reimbursementService";
import { formatDate } from "../../lib/utils/dateUtils";
import ReimbursementStatusBadge from "../../components/reimbursements/ReimbursementStatusBadge";
import PageHeader from "../../components/common/PageHeader";
import { canCandidateEditReimbursement } from "../../lib/utils/reimbursementUtils";

const normalizeListResponse = (response) => ({
  rows: response?.data || response?.rows || [],
  total: response?.total || response?.meta?.total || 0,
});

const ReimbursementList = () => {
  const navigate = useNavigate();
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReimbursements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reimbursementService.getMyReimbursements({
        page,
        limit,
      });
      const { rows, total } = normalizeListResponse(response);
      setReimbursements(rows);
      setTotalCount(total || rows.length);
    } catch (error) {
      console.error("Failed to load reimbursements:", error);
      toast.error("Failed to load reimbursement claims");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchReimbursements();
  }, [fetchReimbursements]);

  const columns = [
    {
      key: "active_course_name",
      label: "Active Course",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">
            {row.active_course_name || row.course_name || "-"}
          </span>
          <span className="text-xs text-slate-400">
            {row.claim_number || "Claim ID pending"}
          </span>
        </div>
      ),
    },
    {
      key: "claim_date",
      label: "Date",
      render: (value) => formatDate(value || ""),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <ReimbursementStatusBadge status={value} />,
    },
    {
      key: "view",
      label: "Open",
      align: "center",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => navigate(`/reimbursements/${row.id}`)}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
          title="Open reimbursement"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      align: "center",
      render: (_, row) =>
        canCandidateEditReimbursement(row.status) ? (
          <button
            type="button"
            onClick={() => navigate(`/reimbursements/${row.id}/edit`)}
            className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50"
            title="Edit reimbursement"
          >
            <Edit className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-400">Locked</span>
        ),
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <Meta
        title="Reimbursement Claims"
        description="Create and track reimbursement claims"
      />

      <PageHeader
        title="Reimbursement Claims"
        subtitle="Submit claims, upload proof, and track admin feedback."
        icon={ReceiptText}
        actions={
          <Button
            type="button"
            onClick={() => navigate("/reimbursements/create")}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Create Claim
          </Button>
        }
      />

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-slate-500">
            {totalCount} claim{totalCount !== 1 ? "s" : ""} found
          </p>
          <p className="text-sm text-slate-400">
            Edit is enabled only after admin resend or before first submit.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={reimbursements}
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

export default ReimbursementList;
