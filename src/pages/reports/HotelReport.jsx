import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
    Search,
    Building2,
    SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/utils/dateUtils";
import ReportService from "../../services/reportService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";
import { debounce } from "lodash";

const HotelReport = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState(""); // Hotel Name
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterCourse, setFilterCourse] = useState("");

    // Debounced values
    const [debouncedHotel, setDebouncedHotel] = useState("");
    const [debouncedEmployee, setDebouncedEmployee] = useState("");
    const [debouncedCourse, setDebouncedCourse] = useState("");

    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);

    // Debounce effects
    const updateDebouncedHotel = useCallback(
        debounce((value) => {
            setDebouncedHotel(value);
            setCurrentPage(1);
        }, 500),
        []
    );

    const updateDebouncedEmployee = useCallback(
        debounce((value) => {
            setDebouncedEmployee(value);
            setCurrentPage(1);
        }, 500),
        []
    );

    const updateDebouncedCourse = useCallback(
        debounce((value) => {
            setDebouncedCourse(value);
            setCurrentPage(1);
        }, 500),
        []
    );

    useEffect(() => { updateDebouncedHotel(searchTerm); }, [searchTerm, updateDebouncedHotel]);
    useEffect(() => { updateDebouncedEmployee(filterEmployee); }, [filterEmployee, updateDebouncedEmployee]);
    useEffect(() => { updateDebouncedCourse(filterCourse); }, [filterCourse, updateDebouncedCourse]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const result = await ReportService.getHotelReport({
                hotel_name: debouncedHotel,
                employee: debouncedEmployee,
                course_name: debouncedCourse,
                page: currentPage,
                limit: limit,
            });

            setReportData(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error("Error fetching hotel report:", error);
            toast.error("Failed to load hotel report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [currentPage, limit, debouncedHotel, debouncedEmployee, debouncedCourse]);

    const columns = useMemo(() => [
        {
            key: "sr_no",
            label: "Sr. No.",
            render: (_val, _row, index) => (
                <span className="text-slate-600 font-medium">
                    {(currentPage - 1) * limit + index + 1}
                </span>
            ),
        },
        {
            key: "hotel_name",
            label: "Hotel Name",
            render: (val) => <span className="font-semibold text-slate-800">{val || '-'}</span>,
        },
        {
            key: "employee_id",
            label: "Employee ID",
            render: (val) => <span className="font-medium text-slate-700">{val || '-'}</span>,
        },
        {
            key: "employee_name",
            label: "Employee Name",
            render: (_val, row) => (
                <span className="font-medium text-slate-800">
                    {`${row.first_name || ''} ${row.last_name || ''}`}
                </span>
            ),
        },
        {
            key: "course_name",
            label: "Course Name",
            render: (val) => <span className="text-blue-700 font-medium">{val || '-'}</span>,
        },
        {
            key: "course_dates",
            label: "Course Dates",
            render: (_val, row) => (
                <span className="text-slate-600 text-sm">
                    {row.start_date ? formatDate(row.start_date) : '-'} to {row.end_date ? formatDate(row.end_date) : '-'}
                </span>
            ),
        }
    ], [currentPage, limit]);

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Helmet>
                <title>Hotel Report | MOLMI</title>
            </Helmet>

            {/* Background Details */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-12 -left-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
                <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
                        <div className="bg-sky-100 p-2 rounded-xl">
                            <Building2 className="w-8 h-8 text-sky-600" />
                        </div>
                        Hotel Report
                    </h1>
                    <p className="text-slate-500 mt-1">View list of candidates allotted to hotels</p>
                </div>
            </div>

            <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by Hotel Name..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${showFilters ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                title={showFilters ? 'Hide Filters' : 'Show Filters'}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200/60 transition-all">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Employee Name / ID</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter by Employee..."
                                        className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                                        value={filterEmployee}
                                        onChange={(e) => setFilterEmployee(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course Name</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filter by Course..."
                                        className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                                        value={filterCourse}
                                        onChange={(e) => setFilterCourse(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={reportData}
                loading={loading}
                emptyMessage="No hotel allocations found matching your search."
            />

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                limit={limit}
                onLimitChange={setLimit}
            />
        </div>
    );
};

export default HotelReport;
