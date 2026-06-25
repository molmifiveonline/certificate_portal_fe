import React from "react";
import { CalendarRange, FileDown, CalendarDays } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { selectStyles } from "./reportFormStyles";
import { useAuth } from "../../../context/AuthContext";

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const TrainingActivitiesReportCard = ({
  form,
  onChange,
  onSubmit,
  loading,
  minYear,
  maxYear,
}) => {
  const { hasPermission } = useAuth();

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-violet-100 bg-white/85 shadow-lg shadow-slate-200/70 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

      <div className="border-b border-slate-100 p-6">
        <div className="mb-3 inline-flex items-center rounded-xl bg-violet-50 p-2 text-violet-600">
          <CalendarDays className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">TRG-219 Training Activities</h2>
        <p className="mt-2 text-sm text-slate-600">
          Download the rolling 3-month training activity planner in the TRG-219 format.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="training-activities-start-month"
              className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              <CalendarRange className="h-4 w-4 text-violet-600" />
              Start Month
            </label>
            <select
              id="training-activities-start-month"
              name="start_month"
              value={form.start_month}
              onChange={onChange}
              className={`${selectStyles} cursor-pointer`}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="training-activities-year"
              className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              <CalendarRange className="h-4 w-4 text-violet-600" />
              Report Year
            </label>
            <Input
              id="training-activities-year"
              type="number"
              name="year"
              value={form.year}
              onChange={onChange}
              min={minYear}
              max={maxYear}
              className="px-3"
              placeholder="Enter year"
            />
          </div>
        </div>

        {hasPermission("export_reports") && (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Download TRG-219 Excel
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default TrainingActivitiesReportCard;
