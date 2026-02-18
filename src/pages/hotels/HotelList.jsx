import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Building,
    Eye,
    ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import DetailModal from "../../components/ui/DetailModal";
import hotelService from "../../services/hotelService";
import { toast } from "sonner";

const HotelList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [hotelToDelete, setHotelToDelete] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const navigate = useNavigate();

    const fetchHotels = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            const response = await hotelService.getAllHotels(params);

            if (response.success && response.data) {
                const result = response.data;
                setHotels(Array.isArray(result.data) ? result.data : []);
                setTotalPages(result.totalPages || 1);
                setTotalCount(result.totalCount || 0);
                setCurrentPage(result.page || 1);
            } else {
                setHotels([]);
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
            toast.error("Failed to load hotels.");
            setHotels([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, searchTerm]);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleDelete = (id) => {
        setHotelToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!hotelToDelete) return;
        try {
            await hotelService.deleteHotel(hotelToDelete);
            toast.success("Hotel deleted successfully.");
            fetchHotels();
        } catch (error) {
            toast.error("Failed to delete hotel.");
        } finally {
            setDeleteModalOpen(false);
            setHotelToDelete(null);
        }
    };

    const handleView = (hotel) => {
        setSelectedHotel(hotel);
        setDetailModalOpen(true);
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

    const columns = [
        {
            key: "venue_name",
            label: "Hotel Name",
            sortable: true,
            render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
        },
        {
            key: "venue_address",
            label: "Hotel Address",
            hiddenOnMobile: true,
            render: (val) => (
                <p className="text-sm text-slate-600 line-clamp-1 max-w-xs" title={val}>
                    {val}
                </p>
            ),
        },
        {
            key: "venue_contact",
            label: "Contact",
        },
        {
            key: "email",
            label: "Email",
            hiddenOnTablet: true,
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleView(row)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate(`/hotel-details/edit/${row.id}`)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit Hotel"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Hotel"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Hotels" description="Manage Hotels" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Building className="w-8 h-8 text-blue-600" />
                        </div>
                        Hotel Details
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered hotels/venues</p>
                </div>
                <button
                    onClick={() => navigate('/hotel-details/create')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Add Hotel
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by hotel name, address..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} hotel{totalCount !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={hotels}
                loading={loading}
                emptyMessage="No hotels found."
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
                limit={limit}
                onPageChange={setCurrentPage}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setCurrentPage(1);
                }}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Hotel"
                message="Are you sure you want to delete this hotel? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
            <DetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Hotel Details"
                data={selectedHotel}
                config={[
                    { key: 'venue_name', label: 'Hotel Name' },
                    { key: 'venue_address', label: 'Address' },
                    { key: 'venue_contact', label: 'Contact Number' },
                    { key: 'email', label: 'Email' },
                    {
                        key: 'venue_map_link',
                        label: 'Google Map',
                        render: (val) => val ? (
                            <a href={val} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                View on Map <ExternalLink size={14} />
                            </a>
                        ) : null
                    },
                ]}
            />
        </div>
    );
};

export default HotelList;
