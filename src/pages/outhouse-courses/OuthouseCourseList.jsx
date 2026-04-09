import React, { useCallback, useEffect, useState } from "react";
import { BookOpen, Edit, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import { formatDate } from "../../lib/utils/dateUtils";
import outhouseCourseService from "../../services/outhouseCourseService";

const STATUS_OPTIONS = [
  "Initiated",
  "Course Started",
  "Course Completed",
  "Certificate Generated",
];

const STATUS_STYLES = {
  Initiated: "bg-blue-50 text-blue-700 border-blue-100",
  "Course Started": "bg-orange-50 text-orange-700 border-orange-100",
  "Course Completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Certificate Generated": "bg-green-50 text-green-700 border-green-100",
};

const isOngoingCourse = (course) => {
  if (!course?.start_date || !course?.end_date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(course.start_date);
  const end = new Date(course.end_date);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return start <= today && end >= today && course.status !== "Course Completed";
};

const OuthouseCourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("start_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await outhouseCourseService.getAll({
        page: currentPage,
        limit,
        search: searchTerm.trim(),
        from_date: fromDate,
        to_date: toDate,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const data = response?.data || response?.rows || [];
      const total = response?.total || response?.meta?.total || 0;
      const pages =
        response?.totalPages ||
        response?.meta?.totalPages ||
        Math.max(1, Math.ceil(total / limit));

      setCourses(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (error) {
      setCourses([]);
      toast.error(
        error?.response?.data?.message || "Failed to load outhouse courses",
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    fromDate,
    toDate,
    limit,
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter,
  ]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, statusFilter, fromDate, toDate]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const columns = [
    {
      key: "course_id",
      label: "Course ID",
      sortable: true,
      render: (value) => (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          {value || "Auto"}
        </span>
      ),
    },
    {
      key: "course_name",
      label: "Course",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-800">{value}</div>
          <div className="text-xs text-slate-500">
            {row.topic || "-"} • {row.master_course_name || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "start_date",
      label: "Schedule",
      sortable: true,
      render: (_value, row) => (
        <div className="text-sm text-slate-600">
          {formatDate(row.start_date)} to {formatDate(row.end_date)}
        </div>
      ),
    },
    {
      key: "type_of_location",
      label: "Location Type",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-700">
            {value || row.location_type || "-"}
          </div>
          <div className="text-xs text-slate-500">
            {row.location_name ||
              row.location_of_training ||
              row.other_location ||
              "-"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[value] ||
            "bg-slate-50 text-slate-700 border-slate-100"
          }`}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_value, row) => (
        <button
          type="button"
          onClick={() => navigate(`/outhouse-courses/edit/${row.id}`)}
          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
          title="Edit outhouse course"
        >
          <Edit className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <Meta title="Outhouse Courses" description="Manage outhouse courses" />

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="rounded-xl bg-orange-100 p-2">
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
            Outhouse Courses
          </h1>
          <p className="mt-1 text-slate-500">
            Admin-only outhouse course creation, candidate handling, attendance,
            feedback, and certificates
          </p>
        </div>

        <Button
          onClick={() => navigate("/outhouse-courses/add")}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4" />
          Add Outhouse Course
        </Button>
      </div>

      <Card className="mb-8 overflow-visible rounded-2xl border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search course id, topic or name"
              className="h-10 pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200/60 bg-white/50 px-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="">All status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">From</span>
            <input
              type="date"
              value={fromDate}
              data-has-value={!!fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="date-input-custom relative bg-transparent text-sm outline-none w-32 cursor-pointer"
            />
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">To</span>
            <input
              type="date"
              value={toDate}
              data-has-value={!!toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="date-input-custom relative bg-transparent text-sm outline-none w-32 cursor-pointer"
            />
          </div>

          <div className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-400">
            {totalCount} record{totalCount === 1 ? "" : "s"}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        currentPage={currentPage}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No outhouse courses found."
        rowClassName={(row) =>
          isOngoingCourse(row)
            ? "border-l-4 border-l-orange-500 bg-orange-50/70 hover:bg-orange-100/70"
            : ""
        }
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={setCurrentPage}
        onLimitChange={(value) => {
          setLimit(value);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default OuthouseCourseList;
