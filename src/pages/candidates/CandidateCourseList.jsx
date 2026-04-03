import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Clock, Eye, Search, Book } from "lucide-react";
import Meta from "../../components/common/Meta";
import { toast } from "sonner";
import api from "../../lib/api";
import { Card, CardContent } from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import { Badge } from "../../components/ui/Badge";

const CandidateCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/active-courses");
        setCourses(response.data.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "course started":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "initiated":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "cancelled":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const filteredCourses = courses.filter((course) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      course.course_name?.toLowerCase().includes(searchStr) ||
      course.topic?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / limit);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const columns = [
    {
      key: "course_name",
      label: "Course Details",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">
            {row.course_name || row.topic}
          </span>
          <span className="text-xs text-slate-400">ID: {row.course_id}</span>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Schedule",
      render: (_, row) => (
        <div className="flex flex-col text-xs text-slate-600 gap-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>
              {new Date(row.start_date).toLocaleDateString()} -{" "}
              {new Date(row.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.no_of_days} Days</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge
          className={`${getStatusColor(val)} border shadow-none px-2 py-0.5 text-[10px] uppercase font-bold`}
        >
          {val}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/candidate-course/${row.id}`)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <Meta
        title="My Courses"
        description="View and manage your enrolled courses"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            My Courses
          </h1>
          <p className="text-slate-500 mt-1">
            Track your progress and access your course materials.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-visible z-10">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full h-11 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-xs text-slate-400">
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {paginatedCourses.length === 0 && !loading ? (
        <Card className="bg-white/50 backdrop-blur-xl border border-dashed border-slate-200 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 p-6 rounded-3xl mb-4 text-slate-300">
              <Book className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No courses found
            </h3>
            <p className="text-slate-500 max-w-sm mt-2">
              We couldn't find any courses matching your criteria or you haven't
              been enrolled yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={paginatedCourses}
            loading={loading}
            emptyMessage="No courses found."
            currentPage={currentPage}
            limit={limit}
          />

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredCourses.length}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        </div>
      )}
    </div>
  );
};

export default CandidateCourseList;


