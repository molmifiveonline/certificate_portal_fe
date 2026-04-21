import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils/utils";

const QuickLinkCard = ({ title, description, icon: Icon, gradient, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 text-left shadow-lg backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      "focus:outline-none focus:ring-4 focus:ring-blue-500/10",
    )}
  >
    <div
      className={`absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-bl-full bg-gradient-to-br opacity-20 ${gradient}`}
    />
    <div className="relative z-10 flex items-start justify-between">
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg shadow-black/5",
          gradient,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div className="relative z-10 mt-5">
      <h3 className="text-xl font-bold tracking-tight text-slate-800">
        {title}
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>
    </div>
  </button>
);

const RestrictedAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, hasAnyPermission } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Meta title="Dashboard" description="Restricted Admin Dashboard" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={`Welcome Back, ${user?.first_name || user?.name || "Admin"}!`}
          subtitle="You currently have access to dashboard and course management tools."
          className="mb-0"
        />
        <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-xl">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {hasAnyPermission(["view_master_courses"]) && (
          <QuickLinkCard
            title="Master Courses"
            description="Browse and manage the main course catalog."
            icon={BookOpen}
            gradient="from-blue-500 to-indigo-600"
            onClick={() => navigate("/courses")}
          />
        )}
        {hasAnyPermission(["view_pre_active_courses"]) && (
          <QuickLinkCard
            title="Pre-Active Courses"
            description="Review upcoming nominations and notify nominators."
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
            onClick={() => navigate("/pre-active-courses")}
          />
        )}
        {hasAnyPermission(["view_active_courses"]) && (
          <QuickLinkCard
            title="Active Courses"
            description="Open current course runs and their ongoing workflows."
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
            onClick={() => navigate("/active-courses")}
          />
        )}
      </div>
    </div>
  );
};

export default RestrictedAdminDashboard;
