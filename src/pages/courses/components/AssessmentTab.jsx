import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Mail } from "lucide-react";
import api from "../../../lib/api";
import activeCourseService from "../../../services/activeCourseService";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../lib/utils/utils";

const AssessmentTab = ({ courseId }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await activeCourseService.getAssessmentScores(courseId);
        setCandidates(res.candidates || []);
      } catch (err) {
        toast.error("Failed to load assessment scores");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleSendEmail = async (candidate) => {
    const assessmentId =
      candidate.post_assessment_id || candidate.pre_assessment_id;
    if (!assessmentId) return;
    setSendingEmail(candidate.candidate_id);
    try {
      await activeCourseService.sendAssessmentEmail(
        courseId,
        candidate.candidate_id,
        assessmentId,
      );
      toast.success("Assessment email sent successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.get(
        `/active-courses/${courseId}/training-report`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Training_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Training report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate training report");
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
          <FileText size={20} className="text-blue-600" /> Assessment Scores
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/assessments/new?course_id=${courseId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            Create Assessment
          </Button>
          <Button
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            Generate Training Report
          </Button>
        </div>
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
                Pre Score
              </th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                Post Score
              </th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                Status
              </th>
              <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  No candidates enrolled
                </td>
              </tr>
            ) : (
              candidates.map((c, i) => {
                const hasAssessment =
                  c.pre_assessment_id || c.post_assessment_id;
                return (
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
                      {c.pre_score !== null ? (
                        `${c.pre_score}/${c.pre_total}`
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {c.post_score !== null ? (
                        `${c.post_score}/${c.post_total}`
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {c.post_score !== null ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleSendEmail(c)}
                        disabled={
                          !hasAssessment || sendingEmail === c.candidate_id
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          hasAssessment
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed",
                        )}
                        title={
                          hasAssessment
                            ? "Send assessment result email"
                            : "No assessment results yet"
                        }
                      >
                        <Mail size={14} />
                        {sendingEmail === c.candidate_id
                          ? "Sending..."
                          : "Email"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentTab;


