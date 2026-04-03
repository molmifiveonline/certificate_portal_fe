import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../../components/common/Meta";
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import TablePagination from "../../../components/ui/TablePagination";
import DataTable from "../../../components/ui/DataTable";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import api from "../../../lib/api";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";

const AdminRolesList = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const result = await api.get("/admin-roles", { params });

      if (result.data.success) {
        const responseData = result.data.data;
        const rows = responseData?.data || responseData || [];

        setRoles(Array.isArray(rows) ? rows : []);
        setTotalPages(responseData?.meta?.totalPages || 1);
        setTotalCount(responseData?.meta?.total || rows.length || 0);
        setCurrentPage(responseData?.meta?.page || 1);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching admin roles:", error);
      toast.error("Failed to load admin roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleDelete = (id) => {
    setRoleToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await api.delete(`/admin-roles/${roleToDelete}`);
      toast.success("Admin role deleted successfully.");
      fetchRoles();
    } catch (error) {
      toast.error("Failed to delete admin role.");
    } finally {
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const columns = [
    {
      key: "role_name",
      label: "Role Name",
      render: (val) => (
        <span className="text-sm font-semibold text-slate-800">{val}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (val) => (
        <p className="text-sm text-slate-600 line-clamp-2 max-w-sm" title={val}>
          {val || "No description provided."}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
            val === 1
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {val === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_val, row) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("edit_admin_role") && (
            <button
              onClick={() => navigate(`/admin/admin-roles/edit/${row.id}`)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
              title="Edit Admin Role"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {hasPermission("delete_admin_role") && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Delete Admin Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <Meta title="Admin Roles" description="Manage Admin Roles" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            Admin Roles
          </h1>
          <p className="text-slate-500 mt-1">Manage roles for admin users</p>
        </div>
        {hasPermission("create_admin_role") && (
          <Button
            onClick={() => navigate("/admin/admin-roles/create")}
            className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Admin Role
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role name..."
              className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center">
            <span className="text-xs text-slate-400">
              {totalCount} role{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        emptyMessage="No admin roles found."
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Admin Role"
        message="Are you sure you want to delete this admin role?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminRolesList;


