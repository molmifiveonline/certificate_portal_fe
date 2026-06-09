import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../../lib/utils/errorUtils";
import PageHeader from "../../../components/common/PageHeader";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";
import Meta from "../../../components/common/Meta";
import adminUserService from "../../../services/adminUserService";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import TablePagination from "../../../components/ui/TablePagination";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const AdminUserList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const updateDebouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setDebouncedSearch(value);
                setPage(1);
            }, 500),
        []
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAdmins({
        page,
        limit,
        search: debouncedSearch,
      });
      setAdmins(response.data);
      setTotalCount(response.meta?.total || response.data.length || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error(getErrorMessage(error, "Failed to load admin users"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (id) => {
    setAdminToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      await adminUserService.deleteAdmin(adminToDelete);
      toast.success("Admin user deleted successfully");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin user:", error);
      toast.error(getErrorMessage(error, "Failed to delete admin user"));
    } finally {
      setDeleteModalOpen(false);
      setAdminToDelete(null);
    }
  };

  const columns = [
    {
      key: "first_name",
      label: "Name",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {row.first_name[0]}
            {row.last_name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {row.first_name} {row.last_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact Info",
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {row.email}
          </div>
          {row.mobile && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {row.mobile}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "admin_role_name",
      label: "Admin Role",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700">
            {val || (row.role === "superadmin" ? "Super Admin" : "Admin")}
          </span>
        </div>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (val) => val || "Not specified",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            val === 1
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${val === 1 ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          {val === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission("edit_admin_user") && (
            <button
              onClick={() => navigate(`/admin/users/edit/${row.id}`)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
              title="Edit Admin"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {hasPermission("delete_admin_user") && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Delete Admin"
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
      <Meta title="Admin Users" description="Manage Admin Users" />

      <PageHeader
        title="Admin Users"
        subtitle="Manage system administrators"
        icon={UserCheck}
        actions={
          hasPermission("create_admin_user") && (
            <Button
              onClick={() => navigate("/admin/users/create")}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          )
        }
      />

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm mb-8 overflow-visible z-10">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto items-center">
            <span className="text-xs text-slate-400">
              {totalCount} user{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        emptyMessage="No admin users found."
        currentPage={page}
        limit={limit}
      />

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Admin User"
        message="Are you sure you want to delete this admin user?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminUserList;


