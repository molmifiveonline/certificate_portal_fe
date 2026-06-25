import React from "react";
import { CalendarRange, FileDown } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";

const TrainingRecordReportCard = ({
  year,
  onYearChange,
  onSubmit,
  loading,
  minYear,
  maxYear,
}) => {
  const { hasPermission } = useAuth();

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-cyan-100 bg-white/85 shadow-lg shadow-slate-200/70 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500" />

      <div className="border-b border-slate-100 p-6">
        <div className="mb-3 inline-flex items-center rounded-xl bg-cyan-50 p-2 text-cyan-600">
          <CalendarRange className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">TRG-218 Training Record</h2>
        <p className="mt-2 text-sm text-slate-600">
          Download the yearly completed training summary in the TRG-218 format.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5 p-6">
        <div>
          <label
            htmlFor="training-record-year"
            className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
          >
            <CalendarRange className="h-4 w-4 text-cyan-600" />
            Report Year
          </label>
          <Input
            id="training-record-year"
            type="number"
            name="year"
            value={year}
            onChange={onYearChange}
            min={minYear}
            max={maxYear}
            className="px-3"
            placeholder="Enter year"
          />
        </div>

        {hasPermission("export_reports") && (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Download TRG-218 Excel
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default TrainingRecordReportCard;
