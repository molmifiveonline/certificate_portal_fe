import React, { useState, useEffect } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../lib/utils/dateUtils";

const CandidateApprovalPortal = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [courseContext, setCourseContext] = useState(null);
  const [status, setStatus] = useState(""); // 'Approved' or 'Rejected'
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoading(true);
        const data = await preActiveCourseService.getCourseByToken(token);
        setCourseContext(data);
      } catch (err) {
        setError(getErrorMessage(err, "Invalid or expired token."));
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContext();
  }, [token]);

  const handleSubmit = async (e, selectedStatus) => {
    e?.preventDefault();

    if (selectedStatus === "Rejected" && !remark.trim()) {
      toast.error("Please provide a reason for rejecting the nomination.");
      return;
    }

    try {
      setSubmitting(true);
      setStatus(selectedStatus);
      await preActiveCourseService.candidateApproval(token, {
        status: selectedStatus,
        remark: remark.trim(),
      });
      setSuccess(true);
      toast.success(`Nomination ${selectedStatus.toLowerCase()} successfully.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit response."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Link Expired or Invalid
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    const isApproved = status === "Approved";
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div
          className={`w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center border ${isApproved ? "border-green-100" : "border-red-100"}`}
        >
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${isApproved ? "bg-green-100" : "bg-red-100"}`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Response Recorded!
          </h2>
          <p className="text-gray-600 mb-6">
            You have <strong>{status.toLowerCase()}</strong> the nomination for{" "}
            <strong>{courseContext?.course?.course_name}</strong>.
          </p>
          {isApproved && (
            <div className="bg-slate-50 p-4 rounded-md text-sm text-gray-700 mb-6 text-left border border-slate-200">
              <p className="font-semibold mb-2">Next Steps:</p>
              <p>
                Your approval has been sent to the administrator for final
                confirmation. You will be notified once the course is confirmed.
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            You may now close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" richColors />
      <div className="mx-auto max-w-2xl">
        {/* Header Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8 border border-slate-200">
          <div className="bg-[#3a5f9e] px-6 py-4">
            <h1 className="text-xl font-bold text-white">
              Course Nomination Review
            </h1>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-lg text-gray-700 mb-2">
                Hello <strong>{courseContext?.entity?.first_name}</strong>,
              </p>
              <p className="text-gray-600 leading-relaxed">
                You have been nominated to participate in the following course.
                Please review the details below and accept or reject the
                nomination.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-5 mb-8 border border-slate-200">
              <h3 className="text-sm font-semibold text-[#3a5f9e] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Course Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Course Name</p>
                  <p className="font-medium text-gray-900 text-lg">
                    {courseContext?.course?.course_name}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(courseContext?.course?.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(courseContext?.course?.end_date)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Venue / Mode</p>
                  <p className="font-medium text-gray-900">
                    {courseContext?.course?.type_of_location === "Online"
                      ? "💻 Online"
                      : `🏢 ${courseContext?.course?.other_location || courseContext?.course?.location_name || "TBA"}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Form */}
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <Input
                  label="Remarks (Optional for Approval, Required for Rejection)"
                  placeholder="Add any comments or reasons here..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  onClick={(e) => handleSubmit(e, "Approved")}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg h-auto"
                >
                  {submitting && status === "Approved" ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  )}
                  Accept Nomination
                </Button>

                <Button
                  onClick={(e) => handleSubmit(e, "Rejected")}
                  disabled={submitting}
                  variant="danger"
                  className="flex-1 py-3 text-lg h-auto"
                >
                  {submitting && status === "Rejected" ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5" />
                  )}
                  Reject Nomination
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MOLMI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default CandidateApprovalPortal;
