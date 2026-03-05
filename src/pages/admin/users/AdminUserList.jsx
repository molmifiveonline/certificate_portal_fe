import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Phone, Mail, MoreVertical } from 'lucide-react';
import Meta from "../../../components/common/Meta";
import adminUserService from '../../../services/adminUserService';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';

const AdminUserList = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, adminId: null });

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminUserService.getAdmins({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm
            });
            setAdmins(response.data);
            setPagination(response.meta);
        } catch (error) {
            console.error('Error fetching admin users:', error);
            toast.error('Failed to load admin users');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin user?')) {
            try {
                await adminUserService.deleteAdmin(id);
                toast.success('Admin user deleted successfully');
                fetchAdmins();
            } catch (error) {
                console.error('Error deleting admin user:', error);
                toast.error(error.response?.data?.message || 'Failed to delete admin user');
            }
        }
    };

    const handleContextMenu = (e, adminId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            adminId
        });
    };

    useEffect(() => {
        const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0, adminId: null });
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="w-full h-full">
            <Meta title="Admin Users" description="Manage Admin Users" />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Users</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage system administrators</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or mobile..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA] transition-all text-sm shadow-sm"
                            />
                        </div>

                        {/* Add Button */}
                        {hasPermission('create_admin_user') && (
                            <button
                                onClick={() => navigate('/admin/users/create')}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:bg-[#004E8A] text-white px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#0060AA]/20 font-medium text-sm ml-auto sm:ml-0 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Admin</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-[50px]">Sr</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-[#0060AA] border-t-transparent rounded-full animate-spin" />
                                                <p className="text-sm">Loading admin users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <p className="text-sm">No admin users found matching your search.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin, index) => (
                                        <tr
                                            key={admin.id}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-context-menu"
                                            onContextMenu={(e) => {
                                                if (hasPermission('edit_admin_user') || hasPermission('delete_admin_user')) {
                                                    handleContextMenu(e, admin.id)
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 font-medium">
                                                    {(pagination.page - 1) * pagination.limit + index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {admin.first_name[0]}{admin.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{admin.first_name} {admin.last_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {admin.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {admin.mobile}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 font-medium">
                                                    {admin.gender || 'Not specified'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === 1
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${admin.status === 1 ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`} />
                                                    {admin.status === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    {hasPermission('edit_admin_user') && (
                                                        <button
                                                            onClick={() => navigate(`/admin/users/edit/${admin.id}`)}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                                            title="Edit Admin"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('delete_admin_user') && (
                                                        <button
                                                            onClick={() => handleDelete(admin.id)}
                                                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                                            title="Delete Admin"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(hasPermission('edit_admin_user') || hasPermission('delete_admin_user')) && (
                                                        <button
                                                            onClick={(e) => handleContextMenu(e, admin.id)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-slate-700 px-2">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 w-48 z-50 overflow-hidden transform origin-top-left animate-in fade-in zoom-in duration-150"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {hasPermission('edit_admin_user') && (
                        <button
                            onClick={() => {
                                navigate(`/admin/users/edit/${contextMenu.adminId}`);
                                setContextMenu({ ...contextMenu, visible: false });
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Admin
                        </button>
                    )}
                    {(hasPermission('edit_admin_user') && hasPermission('delete_admin_user')) && (
                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    )}
                    {hasPermission('delete_admin_user') && (
                        <button
                            onClick={() => {
                                handleDelete(contextMenu.adminId);
                                setContextMenu({ ...contextMenu, visible: false });
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Admin
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
