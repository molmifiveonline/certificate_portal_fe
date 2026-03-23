import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    FileDown,
    Award,
    Printer,
    Edit,
    // Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/utils/dateUtils";
import certificateService from "../../services/certificateService";
import { toast } from "sonner";

const CertificateList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState("");

    const navigate = useNavigate();

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                status: statusFilter,
            };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            const result = await certificateService.getAllCertificates(params);

            const data = Array.isArray(result) ? result : (result.data || []);
            const total = result.total || data.length;

            setCertificates(data);
            setTotalPages(result.totalPages || Math.ceil(total / limit));
            setTotalCount(total);
        } catch (error) {
            console.error("Error fetching certificates:", error);
            toast.error("Failed to load certificates.");
            setCertificates([]);
        } finally {
            setLoading(false);
        }

    }, [currentPage, limit, searchTerm, statusFilter]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    // const handleDelete = async (id) => {
    //     if (!window.confirm("Are you sure you want to delete this certificate?")) return;
    //     try {
    //         await certificateService.deleteCertificate(id);
    //         toast.success("Certificate deleted successfully");
    //         fetchCertificates();
    //     } catch (error) {
    //         console.error("Error deleting certificate:", error);
    //         toast.error("Failed to delete certificate");
    //     }
    // };

    const handleExport = async () => {
        try {
            if (!certificates.length) {
                toast.error('No certificates to export');
                return;
            }

            const headers = ['Certificate No.', 'Type', 'Candidate Name', 'Task/Topic', 'Course Name', 'Issue Date', 'Status'];
            const csvContent = [
                headers.join(','),
                ...certificates.map((cert) => [
                    cert.certificate_no,
                    `"${cert.type || ''}"`,
                    `"${cert.candidate_name}"`,
                    `"${cert.topic}"`,
                    `"${cert.master_course_name}"`,
                    formatDate(cert.issue_date),
                    cert.status === 0 ? "Valid" : "Invalid"
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificates-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            toast.error("Failed to export data.");
        }
    };

    const columns = [
        {
            key: "certificate_no",
            label: "Certificate No.",
            sortable: true,
            className: "whitespace-normal break-words",
            render: (val) => <span className="font-medium text-slate-800">{val}</span>,
        },
        {
            key: "candidate_name",
            label: "Candidate Name",
            sortable: true,
            className: "whitespace-normal break-words",
        },
        {
            key: "type",
            label: "Type",
            sortable: true,
            className: "whitespace-normal",
            render: (val) => (
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {val || "-"}
                </span>
            ),
        },
        {
            key: "topic",
            label: "Topic",
            sortable: true,
            className: "whitespace-normal break-words",
        },
        {
            key: "master_course_name",
            label: "Course Name",
            sortable: true,
            className: "whitespace-normal break-words",
        },
        {
            key: "issue_date",
            label: "Issue Date",
            sortable: true,
            className: "whitespace-normal",
            render: (val) => formatDate(val),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            className: "whitespace-normal",
            render: (val) => (
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${val === 0
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                        }`}
                >
                    {val === 0 ? "Valid" : "Invalid"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => window.open(`/certificates/print/${row.id}`, '_blank')}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        title="Print"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate(`/certificates/edit/${row.id}`)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {/* <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button> */}
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Certificates" description="Manage Certificates" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Award className="w-8 h-8 text-blue-600" />
                        </div>
                        Certificates
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all generated certificates</p>
                </div>
                <Button
                    onClick={() => navigate("/certificates/create")}
                    className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                >
                    <Award className="w-4 h-4" />
                    Add Certificate
                </Button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search certificates..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 bg-white/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Status</option>
                            <option value="0">Valid</option>
                            <option value="1">Invalid</option>
                        </select>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} certificate{totalCount !== 1 ? 's' : ''}</span>
                        <Button
                            onClick={handleExport}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <FileDown className="w-4 h-4" />
                            Export Certificate Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={certificates}
                loading={loading}
                emptyMessage="No certificates found."
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

export default CertificateList;
