import { debounce } from "lodash";
import React, { useEffect, useState, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Printer, Award, Search } from "lucide-react";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Card, CardContent } from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import { formatDate } from "../../lib/utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import certificateService from "../../services/certificateService";
import { toast } from "sonner";
import {
  buildLoggedInCandidateIdentity,
  isCertificateOwnedByCandidate,
} from "../../lib/utils/candidateUtils";

const CandidateCertificateList = () => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const updateDebouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setDebouncedSearch(value);
                setCurrentPage(1);
            }, 500),
        []
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let isMounted = true;

    const fetchCertificates = async () => {
      setLoading(true);

      try {
        const loggedInCandidate = buildLoggedInCandidateIdentity(user);
        const certificateResult = loggedInCandidate?.id
          ? await certificateService.getCandidateCertificates(loggedInCandidate.id, {
              limit: 1000,
            })
          : await certificateService.getAllCertificates({
              limit: 1000,
              is_hidden: 0,
            });
        const rawCertificates = Array.isArray(certificateResult)
          ? certificateResult
          : certificateResult?.data || [];

        const ownedCertificates = rawCertificates.filter(
          (certificate) =>
            Number(certificate.is_hidden) !== 1 &&
            isCertificateOwnedByCandidate(certificate, loggedInCandidate, user),
        );
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const filteredCertificates = normalizedSearch
          ? ownedCertificates.filter((certificate) =>
              [
                certificate?.topic,
                certificate?.master_course_name,
                certificate?.course_level,
                certificate?.certificate_no,
              ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
            )
          : ownedCertificates;
        const paginatedCertificates = filteredCertificates.slice(
          (currentPage - 1) * limit,
          currentPage * limit,
        );
        const total = filteredCertificates.length;

        if (!isMounted) {
          return;
        }

        setCertificates(paginatedCertificates);
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (error) {
        console.error("Error fetching candidate certificates:", error);

        if (isMounted) {
          setCertificates([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error(getErrorMessage(error, "Failed to load certificates."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCertificates();

    return () => {
      isMounted = false;
    };
  }, [currentPage, limit, debouncedSearch, user]);

  const columns = [
    {
      key: "topic",
      label: "Topic",
      sortable: true,
      className: "whitespace-normal break-words",
      render: (value) => value || "-",
    },
    {
      key: "master_course_name",
      label: "Master Course Name",
      sortable: true,
      className: "whitespace-normal break-words",
      render: (value) => value || "-",
    },
    {
      key: "course_level",
      label: "Course Level",
      sortable: true,
      className: "whitespace-normal",
      render: (value) => value || "-",
    },
    {
      key: "certificate_no",
      label: "Certificate No.",
      sortable: true,
      className: "whitespace-normal break-words",
      render: (value) => (
        <span className="font-semibold text-slate-900">{value || "-"}</span>
      ),
    },
    {
      key: "issue_date",
      label: "Issue Date",
      sortable: true,
      className: "whitespace-normal",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => window.open(`/certificates/print/${row.id}`, "_blank")}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
            title="View"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <Meta
        title="My Certificates"
        description="View certificates issued for your completed courses"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="My Certificates"
          subtitle="Only certificates visible to you are listed here."
          icon={Award}
        />
      </div>

      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-visible z-10">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, course or certificate no..."
              className="w-full h-11 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-xs text-slate-400">
              {totalCount} certificate{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {certificates.length === 0 && !loading ? (
        <Card className="bg-white/50 backdrop-blur-xl border border-dashed border-slate-200 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 p-6 rounded-3xl mb-4 text-slate-300">
              <Award className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No certificates found
            </h3>
            <p className="text-slate-500 max-w-sm mt-2">
              No visible certificates are available for your login yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={certificates}
            loading={loading}
            emptyMessage="No certificates found."
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
        </div>
      )}
    </div>
  );
};

export default CandidateCertificateList;
