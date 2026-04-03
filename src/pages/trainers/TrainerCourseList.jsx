import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Edit, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import activeCourseService from "../../services/activeCourseService";
import { formatDate } from "../../lib/utils/dateUtils";

const STATUS_OPTIONS = [
  "",
  "Initiated",
  "Course Started",
  "Assessment Initiated",
  "Feedback Generated",
  "Certificate Generated",
  "Course Completed",
  "Cancelled",
];

const TrainerCourseList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        status: statusFilter,
        from_date: dateRange.start,
        to_date: dateRange.end,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const result = await activeCourseService.getAllCourses(params);
      const data = Array.isArray(result?.data) ? result.data : [];
      const total = Number(result?.total || 0);

      setCourses(data);
      setTotalCount(total);
      setTotalPages(result?.totalPages || Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("Error fetching trainer courses:", error);
      toast.error("Failed to load your courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter, dateRange]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const badgeColors = {
      Initiated: "bg-blue-50 text-blue-600 border-blue-100",
      "Course Started": "bg-orange-50 text-orange-600 border-orange-100",
      "Assessment Initiated": "bg-purple-50 text-purple-600 border-purple-100",
      "Feedback Generated": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "Certificate Generated": "bg-emerald-50 text-emerald-600 border-emerald-100",
      "Course Completed": "bg-green-50 text-green-600 border-green-100",
      Cancelled: "bg-red-50 text-red-600 border-red-100",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColors[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}
      >
        {status || "-"}
      </span>
    );
  };

  const columns = [
    {
      key: "course_name",
      label: "Course Name",
      render: (value) => (
        <span className="font-medium text-slate-800">{value || "-"}</span>
      ),
    },
    { key: "course_id", label: "Course ID" },
    {
      key: "start_date",
      label: "Start Date",
      render: (value) => formatDate(value),
    },
    {
      key: "end_date",
      label: "End Date",
      render: (value) => formatDate(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_value, row) => {
        const isCancelled = row.status === "Cancelled";
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => !isCancelled && navigate(`/my-courses/edit/${row.id}`)}
              disabled={isCancelled}
              className={`p-1.5 rounded-lg transition-all ${
                isCancelled
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
              title={
                isCancelled
                  ? "Editing is disabled for cancelled courses"
                  : "Edit course"
              }
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <Meta title="My Courses" description="Trainer courses" />

      <PageHeader
        title="My Courses"
        subtitle="View and manage your assigned courses"
        icon={BookOpen}
      />

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
        <CardContent className="p-4 sm:p-6 flex flex-wrap lg:flex-nowrap gap-3 items-center">
          <div className="relative w-full lg:w-64 shrink">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shrink-0 cursor-pointer"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status || "all"} value={status}>
                {status || "All Status"}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-white/50 border border-slate-200/60 rounded-xl px-2 h-10 shrink-0">
            <span className="text-xs text-slate-400">From</span>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent border-none focus-visible:ring-0 h-8 w-32 px-1"
              placeholder="DD-MM-YYYY"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/50 border border-slate-200/60 rounded-xl px-2 h-10 shrink-0">
            <span className="text-xs text-slate-400">To</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent border-none focus-visible:ring-0 h-8 w-32 px-1"
              placeholder="DD-MM-YYYY"
            />
          </div>

          <div className="flex gap-3 items-center ml-auto shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {totalCount} course{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        emptyMessage="No courses found."
        currentPage={currentPage}
        limit={limit}
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

export default TrainerCourseList;


