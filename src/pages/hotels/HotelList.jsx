import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    RefreshCcw,
    Plus,
    Edit,
    Trash2,
    Building,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
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

            // Backend returns { success: true, message: "...", data: { data: [...], totalCount, page, limit, totalPages } }
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

    // Debounced search: reset to page 1 when search changes
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

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
        return sortOrder === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const SortableHeader = ({ column, label, className = "" }) => (
        <th
            className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none ${className}`}
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center">
                {label}
                <SortIcon column={column} />
            </div>
        </th>
    );

    return (
        <div className="flex-1 overflow-y-auto w-full">
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
                        <button
                            onClick={fetchHotels}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Hotels Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sr</th>
                                <SortableHeader column="venue_name" label="Hotel Name" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hotel Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : hotels.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No hotels found.
                                    </td>
                                </tr>
                            ) : (
                                hotels.map((hotel, index) => (
                                    <tr key={hotel.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {(currentPage - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {hotel.venue_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 line-clamp-1 max-w-xs" title={hotel.venue_address}>
                                                {hotel.venue_address}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {hotel.venue_contact}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {hotel.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(hotel)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/hotel-details/edit/${hotel.id}`)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit Hotel"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(hotel.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Delete Hotel"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
