import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import activeCourseService from "../../../services/activeCourseService";
import { generateDateRange, formatDateDMY } from "./courseUtils";
import AttendanceRemarkModal from "./AttendanceRemarkModal";

const AttendanceTab = ({ courseId }) => {
  const [candidates, setCandidates] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarkModal, setRemarkModal] = useState({
    open: false,
    candidate: null,
    date: null,
    status: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await activeCourseService.getAttendance(courseId);
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
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const getStatus = (candidate, date) => {
    const present = candidate.is_present ? candidate.is_present.split(",") : [];
    const holidays = candidate.holidays ? candidate.holidays.split(",") : [];
    if (present.includes(date)) return "present";
    if (holidays.includes(date)) return "holiday";
    return "absent";
  };

  const getReason = (candidate, date) => {
    if (!candidate.absent_reasons) return null;
    try {
      const reasons =
        typeof candidate.absent_reasons === "string"
          ? JSON.parse(candidate.absent_reasons)
          : candidate.absent_reasons;
      return reasons[date] || null;
    } catch (e) {
      return null;
    }
  };

  const handleToggle = async (candidate, date) => {
    const currentStatus = getStatus(candidate, date);
    const nextStatus =
      currentStatus === "absent"
        ? "present"
        : currentStatus === "present"
          ? "holiday"
          : "absent";

    if (nextStatus === "absent" || nextStatus === "holiday") {
      setRemarkModal({
        open: true,
        candidate,
        date,
        status: nextStatus,
      });
      return;
    }

    // status 'present' - save immediately
    saveAttendance(candidate, date, nextStatus);
  };

  const saveAttendance = async (candidate, date, status, reason = null) => {
    try {
      await activeCourseService.saveAttendanceSingle(
        courseId,
        candidate.candidate_id,
        date,
        status,
        reason,
      );
      // Update local state
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.candidate_id !== candidate.candidate_id) return c;
          let present = c.is_present
            ? c.is_present.split(",").filter(Boolean)
            : [];
          let holidays = c.holidays
            ? c.holidays.split(",").filter(Boolean)
            : [];
          let reasons = {};
          try {
            reasons = c.absent_reasons
              ? typeof c.absent_reasons === "string"
                ? JSON.parse(c.absent_reasons)
                : c.absent_reasons
              : {};
          } catch (e) {
            console.error("Error parsing absent reasons:", e);
          }

          if (status === "present") {
            if (!present.includes(date)) present.push(date);
            holidays = holidays.filter((d) => d !== date);
            delete reasons[date];
          } else if (status === "holiday") {
            if (!holidays.includes(date)) holidays.push(date);
            present = present.filter((d) => d !== date);
            if (reason) reasons[date] = reason;
          } else {
            present = present.filter((d) => d !== date);
            holidays = holidays.filter((d) => d !== date);
            if (reason) reasons[date] = reason;
          }

          return {
            ...c,
            is_present: present.join(","),
            holidays: holidays.join(","),
            absent_reasons: JSON.stringify(reasons),
          };
        }),
      );
      if (remarkModal.open) {
        setRemarkModal({
          open: false,
          candidate: null,
          date: null,
          status: null,
        });
        toast.success("Attendance updated");
      }
    } catch (err) {
      toast.error("Failed to save attendance");
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
          <Calendar size={20} className="text-blue-600" /> Attendance
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Click cells to cycle:{" "}
          <span className="text-red-500 font-medium">Absent</span> →{" "}
          <span className="text-green-600 font-medium">Present</span> →{" "}
          <span className="text-yellow-600 font-medium">Holiday</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-20 w-16">
                Sr. No.
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 sticky left-[64px] bg-slate-50 z-20 min-w-[200px]">
                Candidate
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  className="px-2 py-3 font-semibold text-slate-600 text-center text-xs whitespace-nowrap"
                >
                  {formatDateDMY(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + dates.length}
                  className="text-center py-8 text-slate-400"
                >
                  No candidates enrolled
                </td>
              </tr>
            ) : (
              candidates.map((c, idx) => (
                <tr key={c.candidate_id} className="border-b border-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-600 sticky left-0 bg-white z-10 w-16">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-800 sticky left-[64px] bg-white z-10">
                    <div className="text-sm">{c.candidate_name}</div>
                    <div className="text-xs text-slate-400">
                      {c.empId || ""}
                    </div>
                  </td>
                  {dates.map((date) => {
                    const status = getStatus(c, date);
                    const reason = getReason(c, date);
                    const bg =
                      status === "present"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : status === "holiday"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-red-50 text-red-500 hover:bg-red-100";
                    const label =
                      status === "present"
                        ? "P"
                        : status === "holiday"
                          ? "H"
                          : "A";
                    return (
                      <td key={date} className="px-1 py-2 text-center">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleToggle(c, date)}
                            className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${bg} flex items-center justify-center relative group`}
                            title={`${c.candidate_name} - ${formatDateDMY(date)} - ${status}${reason ? ": " + reason : ""}`}
                          >
                            {label}
                          </button>
                          {reason && (
                            <span
                              className="text-[10px] text-slate-400 mt-0.5 max-w-[40px] truncate"
                              title={reason}
                            >
                              {reason}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AttendanceRemarkModal
        isOpen={remarkModal.open}
        onClose={() =>
          setRemarkModal({
            open: false,
            candidate: null,
            date: null,
            status: null,
          })
        }
        status={remarkModal.status}
        candidateName={remarkModal.candidate?.candidate_name}
        date={remarkModal.date}
        onSubmit={(reason) =>
          saveAttendance(
            remarkModal.candidate,
            remarkModal.date,
            remarkModal.status,
            reason,
          )
        }
      />
    </div>
  );
};

export default AttendanceTab;
