import React, { useEffect, useMemo, useState } from "react";
import { Bell, BookOpenCheck, ReceiptText, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import notificationService from "../../services/notificationService";
import { formatDate, formatDateTime } from "../../lib/utils/dateUtils";

const summaryCards = (summary) => [
  {
    key: "totalPending",
    label: "Total Pending",
    value: summary.totalPending,
    icon: Bell,
    tone: "bg-slate-100 text-slate-700",
  },
  {
    key: "candidateReimbursements",
    label: "Candidate Claims",
    value: summary.candidateReimbursements,
    icon: ReceiptText,
    tone: "bg-blue-100 text-blue-700",
  },
  {
    key: "candidateApprovals",
    label: "Candidate Approvals",
    value: summary.candidateApprovals,
    icon: BookOpenCheck,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "trainerRequests",
    label: "Trainer Requests",
    value: summary.trainerRequests,
    icon: UserCog,
    tone: "bg-amber-100 text-amber-700",
  },
];

const getStatusVariant = (status = "") => {
  const normalized = status.toLowerCase();
  if (["submitted", "resubmitted", "pending"].includes(normalized)) {
    return "warning";
  }
  if (["approved"].includes(normalized)) {
    return "success";
  }
  if (["rejected", "disapproved"].includes(normalized)) {
    return "destructive";
  }
  return "secondary";
};

const SectionTable = ({ title, description, rows, renderDetails }) => (
  <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
    <CardContent className="p-0">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            {rows.length} pending
          </Badge>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">
          No pending items in this section.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Request</th>
                <th className="px-6 py-3 text-left font-semibold">Details</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Updated</th>
                <th className="px-6 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={`${item.sourceType}-${item.id}`} className="align-top">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-1 max-w-md text-slate-500">{item.message}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{renderDetails(item)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(item.status)} className="capitalize">
                      {String(item.status || "pending").replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDateTime(item.updatedAt || item.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={item.actionUrl}
                      className="inline-flex rounded-lg border border-blue-200 px-3 py-2 font-medium text-blue-700 transition hover:bg-blue-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminNotifications = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getAdminNotifications();
        setData(response);
      } catch (error) {
        console.error("Failed to load admin notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const summary = useMemo(
    () =>
      data?.summary || {
        totalPending: 0,
        candidateReimbursements: 0,
        candidateApprovals: 0,
        trainerRequests: 0,
      },
    [data],
  );

  const sections = data?.sections || {
    candidateReimbursements: [],
    candidateApprovals: [],
    trainerRequests: [],
  };

  return (
    <div className="space-y-8">
      <Meta
        title="Admin Notifications"
        description="Admin request inbox for candidate and trainer actions"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            <span className="rounded-2xl bg-blue-100 p-2 text-blue-700">
              <Bell className="h-8 w-8" />
            </span>
            Notifications
          </h1>
          <p className="mt-1 max-w-3xl text-slate-500">
            Admin-only inbox for requests that need review and action.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-slate-200 px-3 py-1 text-sm text-slate-600">
          {summary.totalPending} pending items
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards(summary).map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${item.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <Card className="rounded-2xl border-slate-200/70 bg-white/90 shadow-sm">
          <CardContent className="p-10 text-center text-slate-500">
            Loading notifications...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <SectionTable
            title="Candidate Reimbursement Requests"
            description="Claims submitted by candidates and waiting for admin decision."
            rows={sections.candidateReimbursements}
            renderDetails={(item) => (
              <div className="space-y-1">
                <div>{item.metadata.candidate_name || item.metadata.candidate_email || "-"}</div>
                <div>{item.metadata.active_course_name || "-"}</div>
                <div>
                  Claim date: {formatDate(item.metadata.claim_date)} | Amount: {item.metadata.amount || "-"}
                </div>
              </div>
            )}
          />

          <SectionTable
            title="Candidate Approval Requests"
            description="Candidate nomination responses that still need final admin action."
            rows={sections.candidateApprovals}
            renderDetails={(item) => (
              <div className="space-y-1">
                <div>{item.metadata.candidate_name || item.metadata.candidate_email || "-"}</div>
                <div>Nominator: {item.metadata.nominator_name || "-"}</div>
                <div>Course: {item.metadata.course_name || "-"}</div>
              </div>
            )}
          />

          <SectionTable
            title="Trainer Requests"
            description="Reserved for trainer-to-admin request flows when those backend requests are available."
            rows={sections.trainerRequests}
            renderDetails={() => "-"}
          />
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
