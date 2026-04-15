import React, { useEffect, useMemo, useState } from "react";
import { History, Search, X } from "lucide-react";
import { Button } from "../ui/Button";
import DataTable from "../ui/DataTable";
import TablePagination from "../ui/TablePagination";
import candidateService from "../../services/candidateService";
import { formatDateTime } from "../../lib/utils/dateUtils";
import { toast } from "sonner";

const HISTORY_DAYS = 60;

const CandidateSyncHistoryModal = ({ isOpen, onClose }) => {
  const [historyRows, setHistoryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const result = await candidateService.getSyncHistory({
          page: currentPage,
          limit,
          search: searchTerm.trim(),
          days: HISTORY_DAYS,
        });

        if (!isMounted) return;

        setHistoryRows(result.data || []);
        setTotalCount(result.total || 0);
      } catch (error) {
        console.error("Failed to load candidate sync history:", error);
        if (isMounted) {
          toast.error("Failed to load synced candidate history");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentPage, limit, searchTerm]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const columns = useMemo(
    () => [
      {
        key: "sync_status",
        label: "Status",
        render: (value) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
              value === "Created"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {value || "-"}
          </span>
        ),
      },
      {
        key: "employee_id",
        label: "Employee ID",
        render: (value) => value || "-",
      },
      {
        key: "candidate_name",
        label: "Candidate Name",
        render: (_value, row) => {
          const fullName = [row.first_name, row.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          return (
            <span className="font-semibold text-slate-800">
              {fullName || row.email || "-"}
            </span>
          );
        },
      },
      {
        key: "passport_no",
        label: "Passport No",
        hiddenOnTablet: true,
        render: (value) => value || "-",
      },
      {
        key: "email",
        label: "Email",
        hiddenOnTablet: true,
        className: "min-w-[220px]",
        render: (value) => value || "-",
      },
      {
        key: "manager",
        label: "Manager",
        hiddenOnTablet: true,
        render: (value) => value || "-",
      },
      {
        key: "created_at",
        label: "Synced At",
        render: (value) => formatDateTime(value),
      },
    ],
    [],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-white/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-600 shadow-sm">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Synced Candidate History
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Showing the last {HISTORY_DAYS} days of candidate API sync history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white/60 px-8 py-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee ID, name, email..."
                className="h-11 w-full rounded-xl border border-slate-200/60 bg-white/80 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm">
              Total Synced Rows: {totalCount}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={historyRows}
            loading={loading}
            emptyMessage={`No synced candidate history found in the last ${HISTORY_DAYS} days.`}
            currentPage={currentPage}
            limit={limit}
            rowKey="id"
          />

          {!loading && totalCount > 0 && (
            <div className="mt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                limit={limit}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/80 px-8 py-5">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSyncHistoryModal;
