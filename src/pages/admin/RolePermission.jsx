import React, { useState, useEffect, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import PageHeader from "../../components/common/PageHeader";
import Meta from "../../components/common/Meta";
import { Shield, Check, X, Save, Users, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const RolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");

  // Fetch all roles and permissions on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          api.get("/admin/roles"),
          api.get("/admin/permissions"),
        ]);
        // Filter out 'admin' role from the list
        const allRoles = rolesRes.data.data || [];
        setRoles(allRoles);
        setPermissions(permissionsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error(
          getErrorMessage(error, "Failed to load roles and permissions."),
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch permissions for the selected role
  useEffect(() => {
    if (!selectedRole) {
      setRolePermissions([]);
      return;
    }

    const fetchRolePermissions = async () => {
      setLoadingRolePermissions(true);
      try {
        const res = await api.get(`/admin/role/${selectedRole.id}`);
        const perms = res.data.data || [];
        setRolePermissions(perms.map((p) => p.id));
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        toast.error(getErrorMessage(error, "Failed to load role permissions."));
      } finally {
        setLoadingRolePermissions(false);
      }
    };
    fetchRolePermissions();
  }, [selectedRole]);

  const groupedPermissions = useMemo(() => {
    const grouped = {};
    permissions.forEach((perm) => {
      const group = perm.group_name || "Other";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(perm);
    });
    return grouped;
  }, [permissions]);

  const filteredGroupedPermissions = useMemo(() => {
    const searchValue = permissionSearch.trim().toLowerCase();
    if (!searchValue) {
      return groupedPermissions;
    }

    return Object.entries(groupedPermissions).reduce(
      (filtered, [groupName, perms]) => {
        const matchingPermissions = perms.filter((perm) => {
          const searchableText = [
            groupName,
            perm.name,
            perm.description,
            perm.slug,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(searchValue);
        });

        if (matchingPermissions.length > 0) {
          filtered[groupName] = matchingPermissions;
        }

        return filtered;
      },
      {},
    );
  }, [groupedPermissions, permissionSearch]);

  const handleTogglePermission = (permissionId) => {
    setRolePermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await api.post(`/admin/role/${selectedRole.id}`, {
        permissionIds: rolePermissions,
      });
      toast.success("Permissions updated successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error(getErrorMessage(error, "Failed to save permissions."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Meta title="Role Permissions" description="Manage Role Permissions" />
      {/* Page Header */}
      <PageHeader
        title="Role Permissions"
        subtitle="Manage permissions for different user roles"
        icon={Shield}
        actions={
          selectedRole && (
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-1">
        {/* Roles List */}
        <Card className="lg:col-span-1 rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-slate-200/60 bg-white/40">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Roles
              </h2>
            </div>
            <div className="divide-y divide-slate-100/50">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full px-4 py-3 text-left transition-all ${
                    selectedRole?.id === role.id
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm capitalize">
                    {role.role_name || role.name}
                  </span>
                </button>
              ))}
              {roles.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No roles found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-200/60 bg-white/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Permissions for{" "}
                    <span className="text-blue-600 capitalize">
                      {selectedRole.role_name || selectedRole.name}
                    </span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={permissionSearch}
                        onChange={(event) =>
                          setPermissionSearch(event.target.value)
                        }
                        placeholder="Search permissions..."
                        className="w-full rounded-xl border border-slate-200/70 bg-white/70 py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      />
                      {permissionSearch && (
                        <button
                          type="button"
                          onClick={() => setPermissionSearch("")}
                          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Clear permission search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {loadingRolePermissions && (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {Object.entries(filteredGroupedPermissions).map(
                    ([groupName, perms]) => (
                      <div key={groupName}>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                          {groupName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {perms.map((perm) => {
                            const isActive = rolePermissions.includes(perm.id);
                            return (
                              <button
                                key={perm.id}
                                onClick={() => handleTogglePermission(perm.id)}
                                disabled={loadingRolePermissions}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                  isActive
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white/50 border-slate-200/60 text-slate-600 hover:bg-slate-50"
                                } disabled:opacity-50`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                    isActive
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-200 text-slate-400"
                                  }`}
                                >
                                  {isActive ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {perm.name}
                                  </p>
                                  {perm.description && (
                                    <p className="text-xs text-slate-500 truncate">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                  {Object.keys(groupedPermissions).length === 0 && (
                    <div className="py-12 text-center text-slate-500">
                      No permissions available.
                    </div>
                  )}
                  {Object.keys(groupedPermissions).length > 0 &&
                    Object.keys(filteredGroupedPermissions).length === 0 && (
                      <div className="py-12 text-center text-slate-500">
                        No permissions match your search.
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg overflow-hidden">
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Select a Role
                </h3>
                <p className="text-sm text-slate-500">
                  Choose a role from the list to view and manage its
                  permissions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermission;
