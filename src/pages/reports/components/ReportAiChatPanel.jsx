import React from "react";
import {
  AlertTriangle,
  Bot,
  Database,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { selectStyles } from "./reportFormStyles";

const examplePrompts = [
  "Summarize the main concerns in this report.",
  "Find records that need manager attention.",
  "Show patterns, risks, and unusual records.",
];

const ReportAiChatPanel = ({
  reportTypes,
  reportType,
  onReportTypeChange,
  prompt,
  onPromptChange,
  onPromptPick,
  onSubmit,
  loading,
  response,
  reportMeta,
}) => {
  const answer = response?.answer;
  const tableColumns = answer?.table_columns || [];
  const displayColumns = tableColumns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => !isRowIdColumn(column));
  const hasTable = answer?.table_rows?.length > 0 && displayColumns.length > 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white/90 shadow-lg shadow-slate-200/70 backdrop-blur">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Report AI</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Ask natural questions against the selected report data.
            </p>
          </div>

          {reportMeta && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <Database className="h-4 w-4 text-indigo-600" />
              <span>{reportMeta.returned_row_count || 0} rows loaded</span>
              {reportMeta.truncated && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  Limited
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <div>
            <label
              htmlFor="report-ai-type"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Report Type
            </label>
            <select
              id="report-ai-type"
              value={reportType}
              onChange={(event) => onReportTypeChange(event.target.value)}
              className={selectStyles}
            >
              {reportTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="report-ai-prompt"
              className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
            >
              <MessageSquareText className="h-4 w-4 text-indigo-600" />
              Question
            </label>
            <textarea
              id="report-ai-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Ask about this report..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPromptPick(item)}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {item}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Asking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ask AI
              </>
            )}
          </button>
        </div>
      </form>

      {answer && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="space-y-5">
            {hasTable && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Supporting Records
                </h3>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Row ID</th>
                        {displayColumns.map(({ column }) => (
                          <th key={column} className="px-3 py-2">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {answer.table_rows.map((row) => (
                        <tr key={row.row_id}>
                          <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">
                            {row.row_id}
                          </td>
                          {displayColumns.map(({ column, index }) => (
                            <td key={`${row.row_id}-${column}`} className="px-3 py-2">
                              {row.values[index] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!hasTable && (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                No supporting records were returned for this question.
              </p>
            )}

            {answer.limitations?.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Limitations
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  {answer.limitations.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
};

const isRowIdColumn = (column) =>
  String(column || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") === "row_id";

export default ReportAiChatPanel;
