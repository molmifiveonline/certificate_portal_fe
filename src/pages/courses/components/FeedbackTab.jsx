import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, RefreshCcw, Mail } from "lucide-react";
import api from "../../../lib/api";
import activeCourseService from "../../../services/activeCourseService";
import { Button } from "../../../components/ui/Button";

const FeedbackTab = ({ courseId }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await activeCourseService.getFeedbackStatus(courseId);
        setCandidates(res.candidates || []);
      } catch (err) {
        toast.error("Failed to load feedback status");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleEmailFeedback = async () => {
    setSendingEmail(true);
    try {
      await api.post(`/active-courses/${courseId}/email/feedback`);
      toast.success("Feedback request emails sent to candidates!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12 text-slate-500">Loading...</div>
    );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> Feedback Status
        </h3>
        <Button
          onClick={handleEmailFeedback}
          disabled={sendingEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          {sendingEmail ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Mail size={16} />
          )}
          <span>{sendingEmail ? "Sending..." : "Email Feedback Request"}</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600">#</th>
              <th className="px-6 py-3 font-semibold text-slate-600">
                Employee ID
              </th>
              <th className="px-6 py-3 font-semibold text-slate-600">
                Candidate Name
              </th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                Feedback Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400">
                  No candidates enrolled
                </td>
              </tr>
            ) : (
              candidates.map((c, i) => (
                <tr
                  key={c.candidate_id}
                  className="border-b border-slate-50 hover:bg-slate-25"
                >
                  <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-6 py-3 font-mono text-slate-600">
                    {c.empId || "-"}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {c.candidate_name}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!c.feedback_completed}
                      readOnly
                      className="h-4 w-4 accent-blue-600"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackTab;


