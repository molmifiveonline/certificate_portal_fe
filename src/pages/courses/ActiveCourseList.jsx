import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Search, FileDown, Plus, Edit, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";

import { Button } from "../../components/ui/Button";
import activeCourseService from "../../services/activeCourseService";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/utils/dateUtils";

const ActiveCourseList = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const updateDebouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setDebouncedSearch(value);
                setCurrentPage(1);
            }, 500),
        []
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("course_name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        status: statusFilter,
        from_date: dateRange.start,
        to_date: dateRange.end,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      const result = await activeCourseService.getAllCourses(params);

      setCourses(Array.isArray(result.data) ? result.data : []);
      setTotalPages(
        result.totalPages || Math.ceil((result.total || 0) / limit),
      );
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error("Error fetching active courses:", error);
      toast.error(getErrorMessage(error, "Failed to load active courses."));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    limit,
    sortBy,
    sortOrder, debouncedSearch,
    statusFilter,
    dateRange,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  

  const handleExport = async () => {
    try {
      if (!courses.length) {
        toast.error("No courses to export");
        return;
      }

      const headers = [
        "Sr No.",
        "Course Name",
        "Course ID",
        "Start Date",
        "End Date",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...courses.map((course, index) =>
          [
            (currentPage - 1) * limit + index + 1,
            `"${course.course_name}"`,
            course.course_id,
            formatDate(course.start_date),
            formatDate(course.end_date),
            course.status,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `active - courses - ${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to export data."));
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const rowClassName = (row) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(row.start_date);
    const end = new Date(row.end_date);

    // Check if ongoing (start <= today <= end) and status is Active or Initiated (ongoing implies not cancelled/completed usually, or just check dates as requested)
    if (
      start <= today &&
      end >= today &&
      !["Cancelled", "Course Completed"].includes(row.status)
    ) {
      return "bg-orange-50/50 hover:bg-orange-100/50 border-l-4 border-l-orange-500";
    }
    return "";
  };

  const columns = [
    {
      key: "course_name",
      label: "Course Name",
      sortable: true,
      render: (val) => (
        <span className="font-medium text-slate-800">{val}</span>
      ),
    },
    {
      key: "course_id",
      label: "Course ID",
      sortable: true,
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "end_date",
      label: "End Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => {
        const badgeColors = {
          Initiated: "bg-blue-50 text-blue-600 border-blue-100",
          "Course Started": "bg-orange-50 text-orange-600 border-orange-100",
          "Assessment Initiated":
            "bg-purple-50 text-purple-600 border-purple-100",
          "Feedback Generated":
            "bg-indigo-50 text-indigo-600 border-indigo-100",
          "Certificate Generated":
            "bg-emerald-50 text-emerald-600 border-emerald-100",
          "Course Completed": "bg-green-50 text-green-600 border-green-100",
          Cancelled: "bg-red-50 text-red-600 border-red-100",
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColors[val] || "bg-slate-50 text-slate-600 border-slate-100"}`}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_val, row) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("edit_active_course") && (
            <button
              onClick={() => navigate(`/active-courses/edit/${row.id}`)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <Meta title="Active Courses" description="Manage Active Courses" />

      <PageHeader
        title="Active Courses"
        subtitle="Manage and track ongoing course sessions"
        icon={LayoutDashboard}
        actions={
          hasPermission("create_active_course") ? (
            <Button
              onClick={() => navigate("/active-courses/add")}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          ) : null
        }
      />

      {/* Filter Bar */}
      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
        <CardContent className="p-4 sm:p-6 flex flex-wrap lg:flex-nowrap gap-3 items-center">
          <div className="relative w-full lg:w-64 shrink">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shrink-0"
          >
            <option value="">All Status</option>
            <option value="Initiated">Initiated</option>
            <option value="Course Started">Course Started</option>
            <option value="Assessment Initiated">Assessment Initiated</option>
            <option value="Feedback Generated">Feedback Generated</option>
            <option value="Certificate Generated">Certificate Generated</option>
            <option value="Course Completed">Course Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-2 bg-white/50 border border-slate-200/60 rounded-xl px-2 h-10 shrink-0">
            <span className="text-xs text-slate-400">From</span>
            <input
              type="date"
              value={dateRange.start}
              data-has-value={!!dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="date-input-custom bg-transparent text-sm focus:outline-none w-32"
            />
          </div>
          <div className="flex items-center gap-2 bg-white/50 border border-slate-200/60 rounded-xl px-2 h-10 shrink-0">
            <span className="text-xs text-slate-400">To</span>
            <input
              type="date"
              value={dateRange.end}
              data-has-value={!!dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="date-input-custom bg-transparent text-sm focus:outline-none w-32"
            />
          </div>

          <div className="flex gap-3 items-center ml-auto shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {totalCount} course{totalCount !== 1 ? "s" : ""}
            </span>
            {hasPermission("export_active_courses") && (
              <Button
                onClick={handleExport}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
              >
                <FileDown className="w-4 h-4" />
                Export Active Excel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        emptyMessage="No active courses found."
        currentPage={currentPage}
        limit={limit}
        sortOrder={sortOrder}
        onSort={handleSort}
        rowClassName={rowClassName}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default ActiveCourseList;
