import React, { useState, useEffect, useCallback, useMemo } from "react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import {
  MANAGER_OPTIONS,
  TRAINER_NATIONALITY_OPTIONS,
} from "../../lib/constants";
import {
  Search,
  FileDown,
  RefreshCcw,
  Edit,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { formatDate } from "../../lib/utils/dateUtils";
import candidateService from "../../services/candidateService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";
import DetailModal from "../../components/ui/DetailModal";
import { debounce } from "lodash";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import CandidateMergeModal from "../../components/candidates/CandidateMergeModal";

const AllCandidateList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterManager, setFilterManager] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [filterStatus, setFilterStatus] = useState("1");
  const [filterRegistrationType, setFilterRegistrationType] = useState("");

  // Debounce search
  const updateDebouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, 500),
    [],
  );

  useEffect(() => {
    updateDebouncedSearch(searchTerm);
  }, [searchTerm, updateDebouncedSearch]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await candidateService.getAllCandidates({
        search: debouncedSearch,
        page: currentPage,
        limit: limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        manager: filterManager,
        rank: filterRank,
        nationality: filterNationality,
        status: filterStatus,
        registration_type: filterRegistrationType || undefined,
      });

      setCandidates(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
      setSelectedCandidateIds([]); // Clear selection on reload
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error(getErrorMessage(error, "Failed to load candidates"));
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    currentPage,
    limit,
    sortBy,
    sortOrder,
    filterManager,
    filterRank,
    filterNationality,
    filterStatus,
    filterRegistrationType,
  ]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setFilterManager("");
    setFilterRank("");
    setFilterNationality("");
    setFilterStatus("1");
    setFilterRegistrationType("");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await candidateService.exportCandidates({
        search: debouncedSearch,
        manager: filterManager,
        rank: filterRank,
        nationality: filterNationality,
        status: filterStatus,
        registration_type: filterRegistrationType || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all-candidates.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Candidates exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(getErrorMessage(error, "Failed to export candidates"));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo(() => {
    const cols = [];

    if (hasPermission("edit_candidate")) {
      cols.push({
        key: "selection",
        label: (
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={candidates.length > 0 && selectedCandidateIds.length === candidates.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCandidateIds(candidates.map((c) => c.id));
              } else {
                setSelectedCandidateIds([]);
              }
            }}
          />
        ),
        render: (_val, row) => (
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={selectedCandidateIds.includes(row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCandidateIds((prev) => [...prev, row.id]);
              } else {
                setSelectedCandidateIds((prev) => prev.filter((id) => id !== row.id));
              }
            }}
          />
        ),
      });
    }

    cols.push({
      key: "employee_id",
      label: "Employee ID",
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-700">{val || "N/A"}</span>
      ),
    });

    cols.push({
      key: "registration_type",
      label: "Reg. Type",
      sortable: true,
      render: (val) => {
        const isMolmi = val === "MOLMI Employee";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isMolmi
                ? "bg-indigo-100 text-indigo-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isMolmi ? "MOLMI" : "Others"}
          </span>
        );
      },
    });

    cols.push(
      {
        key: "prefix",
        label: "Title",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "first_name",
        label: "Candidate Name",
        sortable: true,
        render: (_val, row) => (
          <span className="font-semibold text-slate-800">
            {`${row.first_name || ""} ${row.last_name || ""}`}
          </span>
        ),
      },
      {
        key: "rank",
        label: "Rank",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "created_at",
        label: "Date",
        sortable: true,
        render: (val) => formatDate(val),
      },
      {
        key: "nationality",
        label: "Nationality",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "manager",
        label: "Manager",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (val) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${val === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {val === 1 ? "Active" : "Inactive"}
          </span>
        ),
      },
    );

    if (hasPermission("edit_candidate")) {
      cols.push({
        key: "actions",
        label: "Edit",
        render: (_val, row) => (
          <button
            onClick={() => navigate(`/candidates/edit/${row.id}`)}
            className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all"
            title="Edit Candidate"
          >
            <Edit className="w-4 h-4" />
          </button>
        ),
      });
    }

    return cols;
  }, [navigate, hasPermission, selectedCandidateIds, candidates]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Meta
        title="All Candidates"
        description="Manage All Candidates"
      />
      <PageHeader
        title="All Candidates"
        subtitle="Manage and view all registered MOLMI & Other candidates"
        icon={Users}
        actions={
          <div className="flex flex-wrap gap-3">
            {hasPermission("edit_candidate") && (
              <Button
                onClick={() => setShowMergeModal(true)}
                disabled={selectedCandidateIds.length < 2}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:brightness-110 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Users className="w-4 h-4" />
                Merge Candidates {selectedCandidateIds.length >= 2 ? `(${selectedCandidateIds.length})` : ""}
              </Button>
            )}
          </div>
        }
      />

      <Card className="relative rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-20">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                title={showFilters ? "Hide Filters" : "Show Filters"}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              {hasPermission("export_candidates") && (
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isExporting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  Export Candidate Excel
                </Button>
              )}
            </div>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-slate-200/60 transition-all">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Registration Type
                </label>
                <select
                  className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                  value={filterRegistrationType}
                  onChange={(e) => setFilterRegistrationType(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 0.5rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: `2.5rem`,
                  }}
                >
                  <option value="">All Types</option>
                  <option value="MOLMI Employee">MOLMI Employee</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Manager
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Manager"
                    className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={filterManager}
                    onChange={(e) => setFilterManager(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rank
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Rank"
                    className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={filterRank}
                    onChange={(e) => setFilterRank(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nationality
                </label>
                <SearchableSelect
                  value={filterNationality}
                  onChange={(val) => setFilterNationality(val || "")}
                  placeholder="All Nationalities"
                  options={TRAINER_NATIONALITY_OPTIONS}
                  className="[&>button]:h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <select
                  className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 0.5rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: `2.5rem`,
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full h-10 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={candidates}
        loading={loading}
        emptyMessage="No candidates found matching your search."
        currentPage={currentPage}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        limit={limit}
        onLimitChange={setLimit}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Candidate Details"
        data={selectedCandidate}
        config={[
          { key: "employee_id", label: "Candidate ID" },
          {
            key: "name",
            label: "Full Name",
            render: (_, candidate) =>
              `${candidate.prefix || ""} ${candidate.first_name || ""} ${candidate.middle_name || ""} ${candidate.last_name || ""}`.trim(),
          },
          { key: "email", label: "Email" },
          { key: "mobile", label: "Mobile" },
          { key: "gender", label: "Gender" },
          {
            key: "dob",
            label: "DOB",
            render: (val) => formatDate(val),
          },
          { key: "nationality", label: "Nationality" },
          { key: "passport_no", label: "Passport No." },
          { key: "rank", label: "Rank" },
          { key: "whatsapp_number", label: "WhatsApp" },
          { key: "registration_type", label: "Registration Type" },
        ]}
      />

      {showMergeModal && (
        <CandidateMergeModal
          isOpen={showMergeModal}
          onClose={() => {
            setShowMergeModal(false);
            setSelectedCandidateIds([]);
          }}
          selectedCandidateIds={selectedCandidateIds}
          onMergeSuccess={() => {
            setShowMergeModal(false);
            setSelectedCandidateIds([]);
            fetchCandidates();
          }}
        />
      )}
    </div>
  );
};

export default AllCandidateList;
