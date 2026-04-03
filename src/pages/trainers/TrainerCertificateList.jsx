import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Search, Award } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { formatDate } from "../../lib/utils/dateUtils";
import certificateService from "../../services/certificateService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const TrainerCertificateList = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                trainer_id: user?.id,
            };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            const result = await certificateService.getAllCertificates(params);

            const data = Array.isArray(result) ? result : result.data || [];
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
    }, [currentPage, limit, searchTerm, user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchCertificates();
        }
    }, [fetchCertificates, user?.id]);

    const columns = [
        {
            key: "certificate_no",
            label: "Certificate No.",
            sortable: true,
            render: (val) => (
                <span className="font-medium text-slate-800">{val}</span>
            ),
        },
        {
            key: "empId",
            label: "Employee ID",
            sortable: true,
            render: (val) => val || "—",
        },
        {
            key: "candidate_name",
            label: "Candidate Name",
            sortable: true,
        },
        {
            key: "issue_date",
            label: "Issued Date",
            sortable: true,
            render: (val) => formatDate(val),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="My Certificates" description="View your certificates" />

            {/* Page Header */}
            <PageHeader
                title="Certificates"
                subtitle="View all certificates issued under your training"
                icon={Award}
            />

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by certificate no, name, employee id..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">
                            {totalCount} certificate{totalCount !== 1 ? "s" : ""}
                        </span>
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

export default TrainerCertificateList;


