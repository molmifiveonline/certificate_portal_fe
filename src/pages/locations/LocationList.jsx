import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    RefreshCcw,
    Plus,
    Edit,
    Trash2,
    MapPin,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ExternalLink,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import DetailModal from "../../components/ui/DetailModal";
import locationService from "../../services/locationService";
import { toast } from "sonner";

const LocationList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const navigate = useNavigate();

    const fetchLocations = useCallback(async () => {
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
            const result = await locationService.getLocations(params);

            if (result.success && result.data) {
                setLocations(Array.isArray(result.data.data) ? result.data.data : []);
                setTotalPages(result.data.totalPages || 1);
                setTotalCount(result.data.totalCount || 0);
                setCurrentPage(result.data.page || 1);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
            toast.error("Failed to load locations.");
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, searchTerm]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // Debounced search: reset to page 1 when search changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleDelete = (id) => {
        setLocationToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!locationToDelete) return;
        try {
            await locationService.deleteLocation(locationToDelete);
            toast.success("Location deleted successfully.");
            fetchLocations();
        } catch (error) {
            toast.error("Failed to delete location.");
        } finally {
            setDeleteModalOpen(false);
            setLocationToDelete(null);
        }
    };

    const handleView = (location) => {
        setSelectedLocation(location);
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
            <Meta title="Locations" description="Manage Locations" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <MapPin className="w-8 h-8 text-indigo-600" />
                        </div>
                        Location Management
                    </h1>
                    <p className="text-slate-500 mt-1">Manage training centers and course locations</p>
                </div>
                <button
                    onClick={() => navigate('/location/create')}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Add Location
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code, address..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} location{totalCount !== 1 ? 's' : ''}</span>
                        <button
                            onClick={fetchLocations}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sr</th>
                                <SortableHeader column="location_name" label="Location Name" />
                                <SortableHeader column="short_code" label="Code" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
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
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No locations found.
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc, index) => (
                                    <tr key={loc.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {(currentPage - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{loc.location_name}</span>
                                                <a href={loc.google_map_link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:underline">
                                                    View Map <ExternalLink className="w-2 h-2" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                                                {loc.short_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm text-slate-600">{loc.phone_number}</span>
                                                <span className="text-xs text-slate-400">{loc.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 line-clamp-1 max-w-xs" title={loc.address}>
                                                {loc.address}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(loc)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/location/edit/${loc.id}`)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit Location"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(loc.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Delete Location"
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
                title="Delete Location"
                message="Are you sure you want to delete this training location?"
                confirmText="Delete"
                variant="danger"
            />
            <DetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Location Details"
                data={selectedLocation}
                config={[
                    { key: 'location_name', label: 'Location Name' },
                    { key: 'short_code', label: 'Short Code' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone_number', label: 'Phone Number' },
                    { key: 'address', label: 'Address' },
                    {
                        key: 'google_map_link',
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

export default LocationList;
