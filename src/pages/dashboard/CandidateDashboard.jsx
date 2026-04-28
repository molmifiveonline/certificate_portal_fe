import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  Loader2,
} from "lucide-react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import certificateService from "../../services/certificateService";
import { toast } from "sonner";
import { cn } from "../../lib/utils/utils";
import {
  buildLoggedInCandidateIdentity,
  isCertificateOwnedByCandidate,
} from "../../lib/utils/candidateUtils";
import { formatDate } from "../../lib/utils/dateUtils";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  loading,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/40 shadow-lg",
        "bg-white/60 backdrop-blur-2xl",
        onClick ? "cursor-pointer" : "",
      )}
    >
      <div
        className={`absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-bl-full bg-gradient-to-br opacity-20 ${gradient}`}
      />

      <div className="relative z-10 flex justify-between items-start">
        <div
          className={cn(
            "rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg shadow-black/5",
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="relative z-10 mt-4">
        {loading ? (
          <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200" />
        ) : (
          <h3 className="text-4xl font-bold tracking-tight text-slate-800">
            {value}
          </h3>
        )}
        <p className="mt-1 text-sm font-semibold text-slate-500">{title}</p>
      </div>
    </div>
  );
};

const isActiveCourse = (course) => {
  const status = course?.status?.toLowerCase?.() || "";
  return status !== "completed" && status !== "cancelled";
};

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    activeCourses: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const loggedInCandidate = buildLoggedInCandidateIdentity(user);
        const certificateRequest = loggedInCandidate?.id
          ? certificateService.getCandidateCertificates(loggedInCandidate.id, {
              limit: 1000,
            })
          : certificateService.getAllCertificates({ limit: 1000, is_hidden: 0 });

        const [coursesRes, certsRes] = await Promise.all([
          api.get("/active-courses"),
          certificateRequest,
        ]);

        const courseRows = coursesRes.data?.data || [];
        const certificateRows = Array.isArray(certsRes) ? certsRes : certsRes.data || [];
        const visibleCertificates = certificateRows.filter(
          (certificate) =>
            Number(certificate.is_hidden) !== 1 &&
            isCertificateOwnedByCandidate(certificate, loggedInCandidate, user),
        );

        if (!isMounted) {
          return;
        }

        setStats({
          activeCourses: courseRows.filter(isActiveCourse).length,
          totalCertificates: visibleCertificates.length,
        });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        if (isMounted) {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Meta title="Candidate Dashboard" description="Candidate Dashboard" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={`Welcome Back, ${user?.first_name || user?.name || "Candidate"}!`}
          subtitle="Review your active courses and available certificates."
          className="mb-0"
        />
        <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-xl">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-700">
            {formatDate(new Date())}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatsCard
          title="Total Active Courses"
          value={stats.activeCourses}
          icon={BookOpen}
          gradient="from-blue-500 to-indigo-600"
          loading={loading}
          onClick={() => navigate("/candidate-courses")}
        />
        <StatsCard
          title="Total Certificates"
          value={stats.totalCertificates}
          icon={Award}
          gradient="from-emerald-500 to-teal-600"
          loading={loading}
          onClick={() => navigate("/candidate-certificates")}
        />
      </div>
    </div>
  );
};

export default CandidateDashboard;
