import React, { useEffect, useState } from "react";
import { Edit, Loader2, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import BackButton from "../../components/common/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import reimbursementService from "../../services/reimbursementService";
import { formatDate, formatDateTime } from "../../lib/utils/dateUtils";
import ReimbursementAttachments from "../../components/reimbursements/ReimbursementAttachments";
import ReimbursementRemarksPanel from "../../components/reimbursements/ReimbursementRemarksPanel";
import ReimbursementStatusBadge from "../../components/reimbursements/ReimbursementStatusBadge";
import { canCandidateEditReimbursement } from "../../lib/utils/reimbursementUtils";

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-700">{value || "-"}</p>
  </div>
);

const ReimbursementDetails = () => {
  const { id } = useParams();
  const [reimbursement, setReimbursement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReimbursement = async () => {
      try {
        setLoading(true);
        const response = await reimbursementService.getReimbursementById(id);
        setReimbursement(response?.data || response);
      } catch (error) {
        console.error("Failed to load reimbursement details:", error);
        toast.error("Failed to load reimbursement details");
      } finally {
        setLoading(false);
      }
    };

    fetchReimbursement();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!reimbursement) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
      <Meta title="Reimbursement Details" description="View reimbursement details" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            <span className="rounded-2xl bg-blue-100 p-2 text-blue-600">
              <ReceiptText className="h-8 w-8" />
            </span>
            Reimbursement Details
          </h1>
          <p className="mt-1 text-slate-500">
            Claim #{reimbursement.claim_number || reimbursement.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BackButton to="/reimbursements" label="Back to Claims" />
          {canCandidateEditReimbursement(reimbursement.status) && (
            <Link
              to={`/reimbursements/${reimbursement.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <p className="text-sm text-slate-500">Current Status</p>
            <div className="mt-2">
              <ReimbursementStatusBadge status={reimbursement.status} />
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Created: {formatDateTime(reimbursement.created_at)}</p>
            <p>Updated: {formatDateTime(reimbursement.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Claim Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DetailRow
            label="Active Course"
            value={reimbursement.active_course_name || reimbursement.course_name}
          />
          <DetailRow label="Claim Date" value={formatDate(reimbursement.claim_date)} />
          <DetailRow label="Expense Category" value={reimbursement.expense_category} />
          <DetailRow label="Amount" value={reimbursement.amount} />
          <DetailRow label="Payment Mode" value={reimbursement.payment_mode} />
          <DetailRow
            label="Account Holder Name"
            value={reimbursement.bank_account_holder_name}
          />
          <DetailRow label="Bank Name" value={reimbursement.bank_name} />
          <DetailRow label="Account Number" value={reimbursement.account_number} />
          <DetailRow label="IFSC Code" value={reimbursement.ifsc_code} />
          <DetailRow
            label="Expense Description"
            value={reimbursement.expense_description}
          />
          <DetailRow label="Candidate Notes" value={reimbursement.candidate_notes} />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReimbursementAttachments attachments={reimbursement.attachments || []} />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Admin Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReimbursementRemarksPanel reimbursement={reimbursement} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReimbursementDetails;
