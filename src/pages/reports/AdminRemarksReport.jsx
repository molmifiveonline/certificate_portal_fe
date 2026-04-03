import React, { useState, useEffect } from "react";
import { Search, Printer, Download, FileText, Calendar, Filter, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import preActiveCourseService from "../../services/preActiveCourseService";
import activeCourseService from "../../services/activeCourseService";
import candidateService from "../../services/candidateService";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import TablePagination from "../../components/ui/TablePagination";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";

const SelectField = ({ label, name, options, value, onChange, error, required, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${error ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
);

const AdminRemarksReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const [courses, setCourses] = useState([]);
    const [candidates, setCandidates] = useState([]);

    const [filters, setFilters] = useState({
        course_id: "",
        candidate_id: "",
        search: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10; // For frontend pagination if needed, else we get all and slice

    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Reports", href: "/reports" },
        { label: "Admin Remarks", href: "#" }
    ];

    useEffect(() => {
        fetchDropdowns();
        fetchReports();
    }, []);

    const fetchDropdowns = async () => {
        try {
            // Can fetch all courses and candidates for filters
            // Simplification: just using Pre-Active Courses for select
            const cRes = await preActiveCourseService.getAll({ limit: 1000 });
            setCourses(cRes.data || []);

            // Getting all candidates might be heavy, but for filter it's useful
            const candRes = await candidateService.getAllCandidates({ limit: 1000 });
            setCandidates(candRes.data || []);
        } catch (error) {
            console.error("Error loading filters", error);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await preActiveCourseService.getAdminRemarksReport(filters);
            setReports(data || []);
            setCurrentPage(1);
        } catch (error) {
            toast.error("Failed to fetch admin remarks report");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchReports();
    };

    // Using backend filtering for search term, so we just use the fetched reports
    const filteredReports = reports;

    const totalPages = Math.ceil(filteredReports.length / limit);
    const paginatedReports = filteredReports.slice((currentPage - 1) * limit, currentPage * limit);

    const exportToPDF = () => {
        const doc = new jsPDF("landscape");
        doc.text("Admin Remarks Report", 14, 15);

        const tableColumn = ["Course Name", "Candidate Name", "Email", "Cand. Status", "Cand. Remark", "Admin Status", "Admin Remark", "Action Date"];
        const tableRows = [];

        filteredReports.forEach(r => {
            tableRows.push([
                r.course_name,
                `${r.first_name} ${r.last_name || ''}`,
                r.email,
                r.candidate_approval_status,
                r.candidate_remark || '-',
                r.admin_approval_status,
                r.admin_remark || '-',
                r.admin_action_date ? new Date(r.admin_action_date).toLocaleDateString() : '-'
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`Admin_Remarks_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
            "Course Name": r.course_name,
            "Candidate Name": `${r.first_name} ${r.last_name || ''}`,
            "Candidate Email": r.email,
            "Candidate Status": r.candidate_approval_status,
            "Candidate Remark": r.candidate_remark || '-',
            "Admin Status": r.admin_approval_status,
            "Admin Remark": r.admin_remark || '-',
            "Action Date": r.admin_action_date ? new Date(r.admin_action_date).toLocaleDateString() : '-'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Remarks");
        XLSX.writeFile(workbook, `Admin_Remarks_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            <Meta title="Admin Remarks Report" description="View and export admin remarks for candidate nominations" />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                <PageHeader
                    title="Admin Remarks Report"
                    subtitle="View and export admin remarks for candidate nominations"
                    titleClassName="text-xl"
                    className="mb-0"
                />
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={filteredReports.length === 0}
                        className="h-10 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                    <Button
                        variant="primary"
                        onClick={exportToExcel}
                        disabled={filteredReports.length === 0}
                        className="h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-none"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-8 space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Filter size={14} />
                        Filter Data
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <SelectField
                            label="Filter by Course"
                            name="course_id"
                            value={filters.course_id}
                            onChange={handleFilterChange}
                            options={[
                                { label: 'All Courses', value: '' },
                                ...courses.map(c => ({ label: c.course_name, value: c.id }))
                            ]}
                        />

                        <SelectField
                            label="Filter by Candidate"
                            name="candidate_id"
                            value={filters.candidate_id}
                            onChange={handleFilterChange}
                            options={[
                                { label: 'All Candidates', value: '' },
                                ...candidates.map(c => ({ label: `${c.first_name} ${c.last_name || ''}`, value: c.id }))
                            ]}
                        />

                        <Input
                            label="Search"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search name, email..."
                            className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                        />

                        <div className="flex items-end">
                            <Button
                                onClick={applyFilters}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] font-semibold"
                            >
                                <Search className="mr-2 h-4 w-4" /> Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Remarks Summary
                        </h2>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                            Showing {paginatedReports.length} of {filteredReports.length} Records
                        </span>
                    </div>

                    <div className="overflow-x-auto text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                                    <th className="px-6 py-4">Course Details</th>
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Approval Status</th>
                                    <th className="px-6 py-4">Remarks</th>
                                    <th className="px-6 py-4">Timeline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                                <span>Analyzing records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            No records found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReports.map((r, i) => (
                                        <tr key={r.id + i} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800 max-w-[200px] truncate" title={r.course_name}>{r.course_name}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <BookOpen size={10} />
                                                    Pre-Active Module
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{r.first_name} {r.last_name || ''}</div>
                                                <div className="text-slate-500 text-xs">{r.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase w-10">Cand:</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${r.candidate_approval_status === "Approved" ? "bg-green-100 text-green-700 border border-green-200" :
                                                            r.candidate_approval_status === "Rejected" ? "bg-red-100 text-red-700 border border-red-200" :
                                                                "bg-amber-100 text-amber-700 border border-amber-200"
                                                            }`}>
                                                            {r.candidate_approval_status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase w-10">Admin:</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${r.admin_approval_status === "Approved" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                                            r.admin_approval_status === "Rejected" ? "bg-red-100 text-red-700 border border-red-200" :
                                                                "bg-slate-100 text-slate-600 border border-slate-200"
                                                            }`}>
                                                            {r.admin_approval_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="text-xs">
                                                        <span className="text-slate-400 mr-2">C:</span>
                                                        <span className="text-slate-600 italic" title={r.candidate_remark}>
                                                            {r.candidate_remark ? `"${r.candidate_remark}"` : "-"}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs font-medium">
                                                        <span className="text-slate-400 mr-2">A:</span>
                                                        <span className="text-slate-800" title={r.admin_remark}>
                                                            {r.admin_remark || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    {r.admin_action_date ? new Date(r.admin_action_date).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={filteredReports.length}
                                limit={limit}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRemarksReport;


