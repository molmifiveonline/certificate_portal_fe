import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Mail } from "lucide-react";
import api from "../../../lib/api";
import activeCourseService from "../../../services/activeCourseService";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { cn } from "../../../lib/utils/utils";

const AssessmentTab = ({ courseId, isTrainerRole = false }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresRes, courseRes] = await Promise.all([
          activeCourseService.getAssessmentScores(courseId),
          activeCourseService.getCourseById(courseId),
        ]);
        setCandidates(scoresRes.candidates || []);
        setCourseData(courseRes);
        setEvaluation(
          courseRes.trainer_evaluation || "TRAINING IS PROGRESSING SATISFACTORILY",
        );
      } catch (err) {
        toast.error("Failed to load assessment data");
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

  const handleUpdateComment = async (candidateId, comment) => {
    try {
      await activeCourseService.updateTrainerComment(
        courseId,
        candidateId,
        comment,
      );
      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId ? { ...c, trainer_comment: comment } : c,
        ),
      );
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  const handleSaveEvaluation = async () => {
    setIsSaving(true);
    try {
      await activeCourseService.updateCourse(courseId, {
        trainer_evaluation: evaluation,
      });
      toast.success("Trainer evaluation saved");
    } catch (err) {
      toast.error("Failed to save evaluation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Auto-save evaluation before generating report
      await activeCourseService.updateCourse(courseId, {
        trainer_evaluation: evaluation,
      });

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
      link.setAttribute("download", `Training_Report_${courseId}.pdf`);
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Assessment Scores
          </h3>
          <div className="flex gap-2">
            {!isTrainerRole && (
              <Button
                onClick={() => navigate(`/assessments/new?course_id=${courseId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Create Assessment
              </Button>
            )}
            <Button
              onClick={handleGenerateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex gap-2"
            >
              <FileText size={16} />
              Generate Training Report
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 w-16">
                  Sr. No.
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Candidate Name
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Employee ID
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                  Pre Score
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                  Post Score
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Trainer Comment
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No candidates enrolled
                  </td>
                </tr>
              ) : (
                candidates.map((c, i) => {
                  const hasAssessment =
                    c.post_assessment_id || c.pre_assessment_id;
                  return (
                    <tr
                      key={c.candidate_id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {c.candidate_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {c.empId || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.pre_score !== null ? (
                          <span className="font-bold text-blue-600">
                            {c.pre_score}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400 text-xs ml-1">
                          /{c.pre_total || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.post_score !== null ? (
                          <span className="font-bold text-green-600">
                            {c.post_score}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <span className="text-slate-400 text-xs ml-1">
                          /{c.post_total || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <input
                          type="text"
                          defaultValue={c.trainer_comment || ""}
                          onBlur={(e) =>
                            handleUpdateComment(c.candidate_id, e.target.value)
                          }
                          placeholder="Add comment..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none transition-all hover:border-slate-300 bg-slate-50/30"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
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

      {/* Trainer Evaluation Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-bold text-slate-800">
            Trainer’s Evaluation / Remarks for this course
          </h4>
          <Button
            onClick={handleSaveEvaluation}
            disabled={isSaving}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isSaving ? "Saving..." : "Save Evaluation"}
          </Button>
        </div>
        <textarea
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all bg-slate-50/30 text-sm"
          placeholder="Enter evaluation..."
        />
        <p className="text-xs text-slate-400 mt-2">
          This evaluation will be displayed in the generated training report.
        </p>
      </div>
    </div>
  );
};

export default AssessmentTab;


