import React, { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Loader2, Save, Send, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import api from "../../lib/api";
import reimbursementService from "../../services/reimbursementService";
import ReimbursementFormFields from "../../components/reimbursements/ReimbursementFormFields";
import ReimbursementAttachments from "../../components/reimbursements/ReimbursementAttachments";
import ReimbursementRemarksPanel from "../../components/reimbursements/ReimbursementRemarksPanel";
import {
  canCandidateEditReimbursement,
  REIMBURSEMENT_STATUS,
  toMultipartFormData,
} from "../../lib/utils/reimbursementUtils";
import {
  formatDateForInput,
  getCurrentDateForInput,
} from "../../lib/utils/dateUtils";

const initialValues = {
  active_course_id: "",
  claim_date: getCurrentDateForInput(),
  expense_category: "",
  expense_description: "",
  amount: "",
  payment_mode: "",
  bank_account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  candidate_notes: "",
  status: REIMBURSEMENT_STATUS.DRAFT,
};

const ReimbursementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [values, setValues] = useState(initialValues);
  const [attachments, setAttachments] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchActiveCourses = async () => {
      try {
        const response = await api.get("/active-courses");
        setActiveCourses(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load active courses:", error);
        toast.error(getErrorMessage(error, "Failed to load active courses"));
      }
    };

    fetchActiveCourses();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchReimbursement = async () => {
      try {
        setLoading(true);
        const response = await reimbursementService.getReimbursementById(id);
        const reimbursement = response?.data || response;
        setValues((prev) => ({
          ...prev,
          ...reimbursement,
          claim_date: formatDateForInput(reimbursement?.claim_date),
        }));
        setAttachments(reimbursement?.attachments || []);
      } catch (error) {
        console.error("Failed to load reimbursement:", error);
        toast.error(getErrorMessage(error, "Failed to load reimbursement"));
      } finally {
        setLoading(false);
      }
    };

    fetchReimbursement();
  }, [id, isEditMode]);

  const editable = useMemo(
    () => !isEditMode || canCandidateEditReimbursement(values.status),
    [isEditMode, values.status],
  );

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const handleAddFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) {
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAttachments((prev) => prev.filter((_, current) => current !== index));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!values.active_course_id) {
      nextErrors.active_course_id = "Please select an active course";
    }
    if (!values.claim_date) {
      nextErrors.claim_date = "Please select a claim date";
    }
    if (!values.expense_category) {
      nextErrors.expense_category = "Please select an expense category";
    }
    if (!values.expense_description?.trim()) {
      nextErrors.expense_description = "Please enter expense description";
    }
    if (!values.amount) {
      nextErrors.amount = "Please enter amount";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persistForm = async (shouldSubmit = false) => {
    if (!editable) {
      toast.error("This reimbursement cannot be edited");
      return;
    }
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const formData = toMultipartFormData(values, attachments);
      const response = isEditMode
        ? await reimbursementService.updateReimbursement(id, formData)
        : await reimbursementService.createReimbursement(formData);

      const reimbursement = response?.data || response;
      const reimbursementId = reimbursement?.id || id;

      if (shouldSubmit && reimbursementId) {
        await reimbursementService.submitReimbursement(reimbursementId);
        toast.success("Reimbursement submitted successfully");
      } else {
        toast.success(
          isEditMode
            ? "Reimbursement updated successfully"
            : "Draft saved successfully",
        );
      }

      navigate(
        shouldSubmit
          ? `/reimbursements/${reimbursementId}`
          : reimbursementId
            ? `/reimbursements/${reimbursementId}/edit`
            : "/reimbursements",
      );
    } catch (error) {
      console.error("Failed to save reimbursement:", error);
      toast.error(getErrorMessage(error, "Failed to save reimbursement"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
      <Meta
        title={isEditMode ? "Edit Reimbursement" : "Create Reimbursement"}
        description="Manage reimbursement claim"
      />

      <PageHeader
        title={isEditMode ? "Edit Reimbursement" : "Create Reimbursement"}
        subtitle="Upload proof, fill claim details, and submit for admin approval."
        icon={Wallet}
        compact={true}
        backTo="/reimbursements"
        backLabel="Back to Claims"
      />

      {!editable && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50/80">
          <CardContent className="p-4 text-sm font-medium text-amber-800">
            This claim is locked. You can only edit it when the admin team sends
            it back for correction.
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Claim Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <ReimbursementFormFields
            values={values}
            errors={errors}
            onChange={handleChange}
            activeCourses={activeCourses}
            disabled={!editable || saving}
          />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Attachments
            </h2>
            <ReimbursementAttachments
              attachments={attachments}
              editable={editable && !saving}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        </CardContent>
      </Card>

      {isEditMode && (
        <Card className="rounded-3xl border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReimbursementRemarksPanel reimbursement={values} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => persistForm(false)}
          disabled={saving || !editable}
          className="gap-2 rounded-xl border-slate-200 bg-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={() => persistForm(true)}
          disabled={saving || !editable}
          className="gap-2 rounded-xl"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit Claim
        </Button>
      </div>
    </div>
  );
};

export default ReimbursementForm;
