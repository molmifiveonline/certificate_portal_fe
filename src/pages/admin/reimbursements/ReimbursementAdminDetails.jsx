import React, { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../lib/utils/errorUtils";
import {
  CheckCircle2,
  Loader2,
  Mail,
  ReceiptText,
  RefreshCcw,
  Reply,
  XCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../../components/common/Meta";
import PageHeader from "../../../components/common/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Textarea } from "../../../components/ui/Textarea";
import reimbursementService from "../../../services/reimbursementService";
import {
  canAdminTakeDecision,
  REIMBURSEMENT_STATUS,
} from "../../../lib/utils/reimbursementUtils";
import { formatDate, formatDateTime } from "../../../lib/utils/dateUtils";
import ReimbursementAttachments from "../../../components/reimbursements/ReimbursementAttachments";
import ReimbursementRemarksPanel from "../../../components/reimbursements/ReimbursementRemarksPanel";
import ReimbursementStatusBadge from "../../../components/reimbursements/ReimbursementStatusBadge";

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-700">{value || "-"}</p>
  </div>
);

const ActionModal = ({
  isOpen,
  title,
  confirmText,
  remarks,
  setRemarks,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-500">
            Add remarks so the candidate and accounts team understand the
            action.
          </p>
          <Textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            className="min-h-[140px]"
            placeholder="Enter remarks"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReimbursementAdminDetails = () => {
  const { id } = useParams();
  const [reimbursement, setReimbursement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalState, setModalState] = useState({ type: "", open: false });
  const [remarks, setRemarks] = useState("");

  const loadReimbursement = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reimbursementService.getAdminReimbursementById(id);
      setReimbursement(response?.data || response);
    } catch (error) {
      console.error("Failed to load reimbursement:", error);
      toast.error(getErrorMessage(error, "Failed to load reimbursement"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReimbursement();
  }, [loadReimbursement]);

  const closeModal = () => {
    setModalState({ type: "", open: false });
    setRemarks("");
  };

  const openModal = (type) => {
    setModalState({ type, open: true });
    setRemarks("");
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);

      if (modalState.type === "approve") {
        await reimbursementService.approveReimbursement(id, { remarks });
        toast.success("Claim approved and sent to accounts workflow");
      }

      if (modalState.type === "disapprove") {
        await reimbursementService.disapproveReimbursement(id, { remarks });
        toast.success("Claim disapproved");
      }

      if (modalState.type === "resubmit") {
        await reimbursementService.requestResubmission(id, { remarks });
        toast.success("Claim sent back to candidate for editing");
      }

      closeModal();
      loadReimbursement();
    } catch (error) {
      console.error("Failed to update reimbursement:", error);
      toast.error(getErrorMessage(error, "Failed to update reimbursement"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setActionLoading(true);
      await reimbursementService.resendApprovedEmail(id);
      toast.success("Approved reimbursement email resent");
      loadReimbursement();
    } catch (error) {
      console.error("Failed to resend approved email:", error);
      toast.error(getErrorMessage(error, "Failed to resend approved email"));
    } finally {
      setActionLoading(false);
    }
  };

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

  const decisionAllowed = canAdminTakeDecision(reimbursement.status);

  return (
    <>
      <div className="space-y-6">
        <Meta title="Reimbursement Review" description="Admin reimbursement review" />

        <PageHeader
          title="Review Reimbursement"
          subtitle={`Claim #${reimbursement.claim_number || reimbursement.id}`}
          icon={ReceiptText}
          backTo="/admin/reimbursements"
          actions={
            reimbursement.status === REIMBURSEMENT_STATUS.APPROVED && (
              <Button
                type="button"
                onClick={handleResendEmail}
                disabled={actionLoading}
                className="gap-2 rounded-xl"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Resend to Accounts
              </Button>
            )
          }
        />

        <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-slate-500">Status</p>
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
              Candidate and Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailRow
              label="Candidate"
              value={reimbursement.candidate_name || reimbursement.candidate_email}
            />
            <DetailRow label="Active Course" value={reimbursement.active_course_name} />
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
              Remarks History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReimbursementRemarksPanel reimbursement={reimbursement} />
          </CardContent>
        </Card>

        {decisionAllowed && (
          <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => openModal("approve")}
                className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                onClick={() => openModal("resubmit")}
                className="gap-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
              >
                <Reply className="h-4 w-4" />
                Resend for Edit
              </Button>
              <Button
                type="button"
                onClick={() => openModal("disapprove")}
                className="gap-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                <XCircle className="h-4 w-4" />
                Disapprove
              </Button>
            </CardContent>
          </Card>
        )}

        {!decisionAllowed && reimbursement.status !== REIMBURSEMENT_STATUS.APPROVED && (
          <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-500">
              <RefreshCcw className="h-4 w-4" />
              No admin decision is available for the current status.
            </CardContent>
          </Card>
        )}
      </div>

      <ActionModal
        isOpen={modalState.open}
        title={
          modalState.type === "approve"
            ? "Approve Claim"
            : modalState.type === "disapprove"
              ? "Disapprove Claim"
              : "Send Back for Edit"
        }
        confirmText={
          modalState.type === "approve"
            ? "Approve"
            : modalState.type === "disapprove"
              ? "Disapprove"
              : "Send Back"
        }
        remarks={remarks}
        setRemarks={setRemarks}
        onClose={closeModal}
        onConfirm={handleAction}
        loading={actionLoading}
      />
    </>
  );
};

export default ReimbursementAdminDetails;


