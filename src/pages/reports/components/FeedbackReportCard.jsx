import React from "react";
import { FileDown, Calendar, Filter, Users } from "lucide-react";
import { inputStyles, selectStyles } from "./reportFormStyles";
import { Input } from "../../../components/ui/Input";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { useAuth } from "../../../context/AuthContext";

const FeedbackReportCard = ({
  dates,
  onDateChange,
  filters,
  onFiltersChange,
  filterOptions,
  onSubmit,
  onBulkDownload,
  loading,
  loadingBulk,
  today,
}) => {
  const { hasPermission } = useAuth();
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/85 shadow-lg shadow-slate-200/70 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500" />

      <div className="border-b border-slate-100 p-6">
        <div className="mb-3 inline-flex items-center rounded-xl bg-sky-50 p-2 text-sky-600">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Feedback Report
          </h2>
          <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Max range: 3 months
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Export candidate feedback with ratings and comments.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="feedback-start-date"
              className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              <Calendar className="h-4 w-4 text-sky-600" />
              Start Date
            </label>
            <Input
              id="feedback-start-date"
              type="date"
              name="start_date"
              value={dates.start_date}
              onChange={onDateChange}
              max={dates.end_date || today}
              className="px-3"
              placeholder="DD-MM-YYYY"
            />
          </div>
          <div>
            <label
              htmlFor="feedback-end-date"
              className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              <Calendar className="h-4 w-4 text-sky-600" />
              End Date
            </label>
            <Input
              id="feedback-end-date"
              type="date"
              name="end_date"
              value={dates.end_date}
              onChange={onDateChange}
              min={dates.start_date}
              max={today}
              className="px-3"
              placeholder="DD-MM-YYYY"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="mb-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Optional Filters
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="feedback-topic"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Topic
              </label>
              <SearchableSelect
                value={filters.topic}
                onChange={(val) =>
                  onFiltersChange({
                    ...filters,
                    topic: val,
                  })
                }
                options={filterOptions.topics}
                placeholder="All Topics"
              />
            </div>
            <div>
              <label
                htmlFor="feedback-manager"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Manager
              </label>
              <SearchableSelect
                value={filters.manager}
                onChange={(val) =>
                  onFiltersChange({
                    ...filters,
                    manager: val,
                  })
                }
                options={filterOptions.managers}
                placeholder="All Managers"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hasPermission("export_reports") && (
            <>
              <button
                type="submit"
                disabled={loading || loadingBulk}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Export Excel
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBulkDownload}
                disabled={loading || loadingBulk}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-red-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingBulk ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Bulk Download PDFs
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default FeedbackReportCard;


