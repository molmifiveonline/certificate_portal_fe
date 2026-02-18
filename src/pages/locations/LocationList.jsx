import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    MapPin,
    ExternalLink,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
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

    const columns = [
        {
            key: "location_name",
            label: "Location Name",
            sortable: true,
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{val}</span>
                    <a href={row.google_map_link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:underline">
                        View Map <ExternalLink className="w-2 h-2" />
                    </a>
                </div>
            ),
        },
        {
            key: "short_code",
            label: "Code",
            sortable: true,
            render: (val) => (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                    {val}
                </span>
            ),
        },
        {
            key: "phone_number",
            label: "Contact Info",
            render: (_val, row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-slate-600">{row.phone_number}</span>
                    <span className="text-xs text-slate-400">{row.email}</span>
                </div>
            ),
        },
        {
            key: "address",
            label: "Address",
            render: (val) => (
                <p className="text-sm text-slate-600 line-clamp-1 max-w-xs" title={val}>
                    {val}
                </p>
            ),
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
                        onClick={() => navigate(`/location/edit/${row.id}`)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit Location"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Location"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

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
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={locations}
                loading={loading}
                emptyMessage="No locations found."
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
