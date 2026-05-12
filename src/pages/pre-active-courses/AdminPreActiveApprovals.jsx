import React, { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, X, ShieldAlert, Loader2, Users } from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Meta from "../../components/common/Meta";
import BackButton from "../../components/common/BackButton";
import { formatDate } from "../../lib/utils/dateUtils";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const AdminPreActiveApprovals = () => {
  const { id } = useParams();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    data: null,
    status: "",
  });
  const [adminRemark, setAdminRemark] = useState("");

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await preActiveCourseService.getPendingAdminApprovals(id);
      setApprovals(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load approvals"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchApprovals();
  }, [fetchApprovals, id]);

  const handleActionClick = (candidate, status) => {
    setActionModal({ isOpen: true, data: candidate, status });
    setAdminRemark(""); // reset
  };

  const confirmAction = async () => {
    if (actionModal.status === "Rejected" && !adminRemark.trim()) {
      toast.error("Admin remark is mandatory for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      await preActiveCourseService.adminApproval(
        actionModal.data.id, // enrollmentId
        { status: actionModal.status, remark: adminRemark.trim() },
      );
      toast.success(`Candidate ${actionModal.status} successfully.`);
      setActionModal({ isOpen: false, data: null, status: "" });
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Meta
        title="Candidate Approvals"
        description="Review and manage candidate nominations"
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <BackButton to="/pre-active-courses" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Admin Candidate Approvals
            </h1>
            <p className="text-sm text-slate-500">
              Review and manage candidate nominations for this course
            </p>
          </div>
        </div>
        {approvals.length > 0 && (
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {
              approvals.filter((a) => a.admin_approval_status === "Pending")
                .length
            }{" "}
            Pending Review
          </span>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Candidate Nominations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-600 font-semibold">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Nominator</th>
                  <th className="px-6 py-4">Certificate Date</th>
                  <th className="px-6 py-4">Candidate Status</th>
                  <th className="px-6 py-4">Rejection Reason</th>
                  <th className="px-6 py-4">Candidate Remark</th>
                  <th className="px-6 py-4">Admin Status</th>
                  <th className="px-6 py-4">Admin Action</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span>Loading approvals...</span>
                      </div>
                    </td>
                  </tr>
                ) : approvals.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No pending or processed approvals found for this course.
                    </td>
                  </tr>
                ) : (
                  approvals.map((appr) => (
                    <tr
                      key={appr.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {appr.first_name} {appr.last_name || ""}
                        </div>
                        <div className="text-xs text-slate-500">
                          {appr.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {appr.nominator_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(appr.previous_certificate_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appr.candidate_approval_status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : appr.candidate_approval_status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {appr.candidate_approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {appr.candidate_approval_status === "Rejected" && appr.candidate_rejection_reason ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              {appr.candidate_rejection_reason}
                            </span>
                            {appr.candidate_rejection_reason === "Not Available" && appr.candidate_available_date && (
                              <div className="text-xs text-slate-500 mt-1">
                                Available: {formatDate(appr.candidate_available_date)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-[200px] truncate text-slate-500"
                          title={appr.candidate_remark}
                        >
                          {appr.candidate_remark || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appr.admin_approval_status === "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : appr.admin_approval_status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {appr.admin_approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="text-xs">
                          {formatDate(appr.admin_action_date)}
                        </div>
                        <div
                          className="max-w-[180px] truncate text-xs text-slate-400"
                          title={appr.admin_remark}
                        >
                          {appr.admin_remark || appr.admin_user_name || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {appr.admin_approval_status === "Pending" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleActionClick(appr, "Approved")
                                }
                                className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleActionClick(appr, "Rejected")
                                }
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              Processed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, data: null, status: "" })
        }
        title={`Confirm Admin ${actionModal.status}`}
      >
        <div className="space-y-4">
          <div
            className={`p-4 rounded-md ${actionModal.status === "Approved" ? "bg-green-50" : "bg-red-50"} flex items-start gap-3`}
          >
            <ShieldAlert
              className={`h-5 w-5 ${actionModal.status === "Approved" ? "text-green-600" : "text-red-600"} mt-0.5 flex-shrink-0`}
            />
            <div>
              <h4
                className={`text-sm font-medium ${actionModal.status === "Approved" ? "text-green-800" : "text-red-800"}`}
              >
                Candidate: {actionModal.data?.first_name}{" "}
                {actionModal.data?.last_name || ""}
              </h4>
              <p
                className={`mt-1 text-sm ${actionModal.status === "Approved" ? "text-green-700" : "text-red-700"}`}
              >
                You are about to {actionModal.status.toLowerCase()} this
                candidate's nomination.
              </p>
            </div>
          </div>

          <div>
            <Input
              label={`Admin Remark ${actionModal.status === "Rejected" ? "(Required)" : "(Optional)"}`}
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
              placeholder="Add reason for approval / rejection"
              required={actionModal.status === "Rejected"}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() =>
                setActionModal({ isOpen: false, data: null, status: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.status === "Approved" ? "primary" : "danger"}
              onClick={confirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : `Confirm ${actionModal.status}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPreActiveApprovals;
