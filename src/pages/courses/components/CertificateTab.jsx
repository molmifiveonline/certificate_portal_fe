import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import activeCourseService from "../../../services/activeCourseService";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { generateDateRange, formatDateDMY } from "./courseUtils";
import { cn } from "../../../lib/utils/utils";

const CertificateTab = ({ courseId, isTrainerRole = false }) => {
  const [candidates, setCandidates] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await activeCourseService.getCertificateData(courseId);
        setCandidates(res.candidates || []);
        if (res.start_date && res.end_date) {
          setDates(
            generateDateRange(
              res.start_date.slice(0, 10),
              res.end_date.slice(0, 10),
            ),
          );
        }
      } catch (err) {
        toast.error("Failed to load certificate data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const calcAttendance = (candidate) => {
    if (dates.length === 0) return 0;
    const present = candidate.is_present
      ? candidate.is_present.split(",").filter(Boolean)
      : [];
    const holidays = candidate.holidays
      ? candidate.holidays.split(",").filter(Boolean)
      : [];
    const workingDays = dates.length - holidays.length;
    if (workingDays <= 0) return 100;
    return Math.round((present.length / workingDays) * 100);
  };

  const isEligible = (candidate) => {
    const attendance = calcAttendance(candidate);
    const score = candidate.post_score || 0;
    const attempt = candidate.post_score_attempt || 1;

    // >60% post score for 1st attempt, >70% for retest
    const requiredScore = attempt > 1 ? 70 : 60;

    return (
      attendance >= 100 &&
      score >= requiredScore &&
      !!candidate.feedback_completed
    );
  };

  const handleGenerateCertificate = async (candidateId) => {
    try {
      await activeCourseService.generateCertificate(courseId, candidateId);
      toast.success("Certificate generated");
      // Refresh data
      const res = await activeCourseService.getCertificateData(courseId);
      setCandidates(res.candidates || []);
    } catch (err) {
      toast.error("Failed to generate certificate");
    }
  };

  const handleToggleActive = async (candidateId, currentValue) => {
    try {
      await activeCourseService.updateCertificateActive(
        courseId,
        candidateId,
        currentValue ? 0 : 1,
      );
      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? { ...c, active: currentValue ? 0 : 1 }
            : c,
        ),
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleHide = async (certificateId, currentValue) => {
    try {
      await activeCourseService.updateCertificateHide(
        courseId,
        certificateId,
        currentValue ? 0 : 1,
      );
      setCandidates((prev) =>
        prev.map((c) =>
          c.certificate_id === certificateId
            ? { ...c, is_hidden: currentValue ? 0 : 1 }
            : c,
        ),
      );
      toast.success("Certificate visibility updated");
    } catch (err) {
      toast.error("Failed to update certificate visibility");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12 text-slate-500">Loading...</div>
    );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Certificates
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold">Criteria:</span> 100% Attendance + (≥60% test OR ≥70% retest) + Feedback
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Sr. No.</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Employee ID</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Candidate Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Assessment</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Attendance</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Feedback</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Generated</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Issue Date</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-400">
                  No candidates enrolled
                </td>
              </tr>
            ) : (
              candidates.map((c, i) => {
                const attendanceSet = calcAttendance(c);
                const eligible = isEligible(c);
                const hasFeedback = !!c.feedback_completed;

                return (
                  <tr
                    key={c.candidate_id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {c.empId || "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.candidate_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold",
                          c.post_score >= 60 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}
                      >
                        {c.post_score ?? "-"}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "font-bold",
                          attendanceSet >= 100 ? "text-green-600" : "text-amber-600"
                        )}
                      >
                        {attendanceSet}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "capitalize",
                          hasFeedback ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                        )}
                      >
                        {hasFeedback ? "Completed" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.certficate_generated ? (
                        <Badge className="bg-emerald-600 text-white border-0">
                          Generated
                        </Badge>
                      ) : (
                        !isTrainerRole ? (
                          <Button
                            size="sm"
                            variant={eligible ? "default" : "outline"}
                            disabled={!eligible}
                            onClick={() => handleGenerateCertificate(c.candidate_id)}
                            className={cn(
                              "text-xs px-3 py-1 h-auto",
                              eligible ? "bg-indigo-600 hover:bg-indigo-700" : "text-slate-400 border-slate-200"
                            )}
                          >
                            Generate
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 text-xs font-medium">
                      {c.generated_date ? formatDateDMY(c.generated_date) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {c.certficate_generated && c.certificate_id ? (
                          <>
                            <button
                              onClick={() => window.open(`/certificates/print/${c.certificate_id}`, "_blank")}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View Certificate"
                            >
                              <FileText size={18} />
                            </button>
                            
                            {!isTrainerRole && (
                              <>
                                <div className="flex items-center gap-2 ml-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">
                                    {c.is_hidden ? "Hidden" : "Public"}
                                  </span>
                                  <button
                                    onClick={() => handleToggleHide(c.certificate_id, c.is_hidden)}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${c.is_hidden ? "bg-rose-500" : "bg-emerald-500"}`}
                                  >
                                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${c.is_hidden ? "left-4.5" : "left-0.5"}`} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleToggleActive(c.candidate_id, c.active)}
                                  className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase border",
                                    c.active 
                                      ? "bg-green-50 text-green-700 border-green-200" 
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                  )}
                                  title="Toggle Active Status"
                                >
                                  {c.active ? "Active" : "Inactive"}
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>
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

export default CertificateTab;
