import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import {
    Search,
    Plus,
    Edit,
    Book
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { studyMaterialService } from "../../services/studyMaterialService";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";

const StudyMaterialList = () => {
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

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy] = useState("created_at");
    const [sortOrder] = useState("desc");
    const navigate = useNavigate();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            };
            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }
            const response = await studyMaterialService.getStudyMaterials(params);

            if (response.success && response.data) {
                setMaterials(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalCount(response.data.total || 0);
            } else {
                setMaterials([]);
            }
        } catch (error) {
            console.error("Error fetching study materials:", error);
            toast.error(getErrorMessage(error, "Failed to load study materials"));
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, debouncedSearch]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const getUserTypeBadgeProps = (type) => {
        switch (type) {
            case 'trainer': return { variant: 'info', children: 'Trainer' };
            case 'candidate': return { variant: 'success', children: 'Candidate' };
            case 'both': return { variant: 'purple', children: 'Both' };
            default: return { variant: 'secondary', children: type };
        }
    };

    const getAccessTypeBadgeProps = (type) => {
        switch (type) {
            case 'view': return { variant: 'warning', children: 'View Only' };
            case 'view_download': return { variant: 'success', children: 'View & Download' };
            default: return { variant: 'secondary', children: type };
        }
    };

    const columns = [
        {
            label: "Master Course",
            key: "master_course_name",
            align: "left"
        },
        {
            label: "Category",
            key: "category",
        },
        {
            label: "User Type",
            key: "user_type",
            render: (value) => <Badge {...getUserTypeBadgeProps(value)} />
        },
        {
            label: "Access Type",
            key: "access_type",
            render: (value) => <Badge {...getAccessTypeBadgeProps(value)} />
        },
        {
            label: "Files",
            key: "files_count",
            render: (value) => <Badge variant="secondary">{value || 0} files</Badge>
        },
        {
            label: "Created At",
            key: "created_at",
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            label: "Actions",
            key: "actions",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/study-material/edit/${row.id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Study Materials" description="Manage Study Materials" />
            <div className="w-full mx-auto">
                <PageHeader
                    title="Study Materials"
                    subtitle="Manage your study materials and documents"
                    icon={Book}
                    compact={true}
                    actions={
                        <Button
                            onClick={() => navigate("/study-material/add")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    }
                />

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        {/* Search and Filters */}
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full sm:max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by category or course..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <DataTable
                            columns={columns}
                            data={materials}
                            loading={loading}
                            emptyMessage="No study materials found"
                            currentPage={currentPage}
                            limit={limit}
                            onRowClick={(row) => navigate(`/study-material/edit/${row.id}`)}
                        />
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalCount={totalCount}
                            limit={limit}
                            onLimitChange={(newLimit) => {
                                setLimit(newLimit);
                                setCurrentPage(1);
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudyMaterialList;
