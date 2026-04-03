import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import activeCourseService from "../../../services/activeCourseService";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { generateDateRange, formatDateDMY } from "./courseUtils";

const CertificateTab = ({ courseId }) => {
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
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> Certificates
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Eligible: 100% attendance + (≥60% 1st test OR ≥70% retest) + feedback
          completed
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">#</th>
              <th className="px-4 py-3 font-semibold text-slate-600">
                Employee ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600">
                Candidate Name
              </th>
              <th
                className="px-4 py-3 font-semibold text-slate-600 text-center"
                title="Post Score (Attempt)"
              >
                Assessment
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Attendance
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Feedback
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Generated
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Active
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Date
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                View
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Hide
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-400">
                  No candidates enrolled
                </td>
              </tr>
            ) : (
              candidates.map((c, i) => {
                const attendance = calcAttendance(c);
                const eligible = isEligible(c);
                return (
                  <tr
                    key={c.candidate_id}
                    className="border-b border-slate-50 hover:bg-slate-25"
                  >
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {c.empId || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {c.candidate_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          c.post_score >= 60
                            ? "text-green-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }
                      >
                        {c.post_score ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          attendance >= 100
                            ? "text-green-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }
                      >
                        {attendance}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!c.feedback_completed}
                        readOnly
                        className="h-4 w-4 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.certficate_generated ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 cursor-default">
                          Generated
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant={eligible ? "default" : "outline"}
                          disabled={!eligible}
                          onClick={() =>
                            handleGenerateCertificate(c.candidate_id)
                          }
                          className="text-xs"
                        >
                          Generate
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.certficate_generated && (
                        <button
                          onClick={() =>
                            handleToggleActive(c.candidate_id, c.active)
                          }
                          className={`w-10 h-5 rounded-full relative transition-colors ${c.active ? "bg-green-500" : "bg-slate-300"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${c.active ? "left-5" : "left-0.5"}`}
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">
                      {c.generated_date ? formatDateDMY(c.generated_date) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.certficate_generated && c.certificate_id ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(
                              `/certificates/print/${c.certificate_id}`,
                              "_blank",
                            )
                          }
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <FileText size={16} />
                        </Button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.certficate_generated && c.certificate_id ? (
                        <button
                          onClick={() =>
                            handleToggleHide(c.certificate_id, c.is_hidden)
                          }
                          className={`w-10 h-5 rounded-full relative transition-colors ${c.is_hidden ? "bg-red-500" : "bg-slate-300"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${c.is_hidden ? "left-5" : "left-0.5"}`}
                          />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
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


