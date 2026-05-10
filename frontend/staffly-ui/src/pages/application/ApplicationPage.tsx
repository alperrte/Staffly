import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { ReactNode } from "react";
import {
    FaBriefcase,
    FaCalendarAlt,
    FaCheck,
    FaChevronRight,
    FaDownload,
    FaEnvelope,
    FaExternalLinkAlt,
    FaEye,
    FaFileAlt,
    FaFilter,
    FaPhone,
    FaSearch,
    FaTimes,
    FaUserFriends,
    FaChevronLeft,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
} from "react-icons/fa";
import { saveAs } from "file-saver";

import {
    getApplications,
    getApplicationCv,
    getJobPostings,
    updateApplicationStatus,
} from "../../services/applicationService";

import type {
    Application,
    JobPosting,
} from "../../services/applicationService";

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";
type SortFilter = "NEWEST" | "OLDEST";

type ConfirmAction =
    | {
    type: "ACCEPT";
    application: Application;
}
    | {
    type: "REJECT";
    application: Application;
}
    | {
    type: "DOWNLOAD";
    application: Application;
}
    | null;

const ApplicationPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [jobPostingFilter, setJobPostingFilter] = useState("ALL");
    const [sortFilter, setSortFilter] = useState<SortFilter>("NEWEST");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const [cvModalApplication, setCvModalApplication] = useState<Application | null>(null);
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [cvLoading, setCvLoading] = useState(false);

    useEffect(() => {
        fetchPageData();
    }, []);

    useEffect(() => {
        return () => {
            if (cvUrl) {
                URL.revokeObjectURL(cvUrl);
            }
        };
    }, [cvUrl]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, jobPostingFilter, sortFilter, startDate, endDate, pageSize]);

    const fetchPageData = async () => {
        try {
            setLoading(true);

            const [applicationData, jobPostingData] = await Promise.all([
                getApplications(),
                getJobPostings(),
            ]);

            const safeApplications = Array.isArray(applicationData) ? applicationData : [];

            setApplications(safeApplications);
            setJobPostings(Array.isArray(jobPostingData) ? jobPostingData : []);
            setSelectedApplication(safeApplications[0] ?? null);
        } catch (error) {
            console.error("Başvurular alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const counts = useMemo(() => {
        const pending = applications.filter((app) => app.status === "PENDING").length;
        const accepted = applications.filter((app) => app.status === "ACCEPTED").length;
        const rejected = applications.filter((app) => app.status === "REJECTED").length;

        return {
            total: applications.length,
            pending,
            accepted,
            rejected,
        };
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const filtered = applications.filter((app) => {
            const fullName = `${app.firstName} ${app.lastName}`.toLowerCase();

            const searchable = [
                fullName,
                app.email,
                app.phone,
                app.departmentName,
                app.subDepartmentName,
                app.positionName,
                app.jobPostingTitle,
                app.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchable.includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ? true : app.status === statusFilter;

            const matchesJob =
                jobPostingFilter === "ALL"
                    ? true
                    : (app.jobPostingTitle || app.positionName || "").toLowerCase() ===
                    jobPostingFilter.toLowerCase();

            const applicationDateValue = app.appliedAt || app.createdAt;
            const applicationDate = applicationDateValue
                ? new Date(applicationDateValue)
                : null;

            const start = startDate
                ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
                : null;

            const end = endDate
                ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
                : null;

            const matchesStartDate =
                !start || !applicationDate ? true : applicationDate >= start;

            const matchesEndDate =
                !end || !applicationDate ? true : applicationDate <= end;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesJob &&
                matchesStartDate &&
                matchesEndDate
            );
        });

        return filtered.sort((a, b) => {
            const firstDate = new Date(a.appliedAt || a.createdAt || 0).getTime();
            const secondDate = new Date(b.appliedAt || b.createdAt || 0).getTime();

            return sortFilter === "NEWEST"
                ? secondDate - firstDate
                : firstDate - secondDate;
        });
    }, [
        applications,
        searchTerm,
        statusFilter,
        jobPostingFilter,
        startDate,
        endDate,
        sortFilter,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));

    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return filteredApplications.slice(startIndex, endIndex);
    }, [filteredApplications, currentPage, pageSize]);

    const formatDate = (date?: string) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Yeni";
            case "ACCEPTED":
                return "Kabul Edildi";
            case "REJECTED":
                return "Reddedildi";
            default:
                return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "PENDING":
                return "border-blue-400/20 bg-blue-500/15 text-blue-300";
            case "ACCEPTED":
                return "border-emerald-400/20 bg-emerald-500/15 text-emerald-300";
            case "REJECTED":
                return "border-rose-400/20 bg-rose-500/15 text-rose-300";
            default:
                return "border-slate-400/20 bg-slate-500/15 text-slate-300";
        }
    };

    const handleDownloadCv = async (application: Application) => {
        try {
            const blob = await getApplicationCv(application.id);
            saveAs(blob, `${application.firstName}_${application.lastName}_CV.pdf`);
        } catch (error) {
            console.error("CV indirilemedi:", error);
        }
    };

    const openCvModal = async (application: Application) => {
        try {
            setCvLoading(true);
            setCvModalApplication(application);

            if (cvUrl) {
                URL.revokeObjectURL(cvUrl);
                setCvUrl(null);
            }

            const blob = await getApplicationCv(application.id);
            const fileUrl = URL.createObjectURL(
                new Blob([blob], { type: "application/pdf" })
            );

            setCvUrl(fileUrl);
        } catch (error) {
            console.error("CV görüntülenemedi:", error);
        } finally {
            setCvLoading(false);
        }
    };

    const closeCvModal = () => {
        if (cvUrl) {
            URL.revokeObjectURL(cvUrl);
        }

        setCvUrl(null);
        setCvModalApplication(null);
        setCvLoading(false);
    };

    const handleStatusUpdate = async (
        application: Application,
        status: "ACCEPTED" | "REJECTED"
    ) => {
        if (application.status !== "PENDING") {
            return;
        }

        try {
            const updated = await updateApplicationStatus(application.id, status);

            const nextStatus = updated?.status ?? status;

            setApplications((prev) =>
                prev.map((item) =>
                    item.id === application.id
                        ? { ...item, status: nextStatus }
                        : item
                )
            );

            setSelectedApplication((prev) =>
                prev?.id === application.id
                    ? { ...prev, status: nextStatus }
                    : prev
            );
        } catch (error) {
            console.error("Durum güncellenemedi:", error);
        }
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        if (confirmAction.type === "ACCEPT") {
            await handleStatusUpdate(confirmAction.application, "ACCEPTED");
        }

        if (confirmAction.type === "REJECT") {
            await handleStatusUpdate(confirmAction.application, "REJECTED");
        }

        if (confirmAction.type === "DOWNLOAD") {
            await handleDownloadCv(confirmAction.application);
        }

        setConfirmAction(null);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setJobPostingFilter("ALL");
        setSortFilter("NEWEST");
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);
        setPageSize(10);
    };

    return (
        <div className="min-h-full w-full bg-[#020617] p-0 text-slate-100">
            <div className="flex min-h-screen w-full flex-col bg-slate-950/55 p-5 shadow-[0_0_55px_rgba(15,23,42,0.75)]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Başvurular</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Başvuruları durumlarına göre yönetin, arayın ve detaylarını inceleyin.
                    </p>
                </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                    title="Yeni Başvurular"
                    value={counts.pending}
                    subtitle="İşlem bekleyen"
                    icon={<FaUserFriends />}
                    color="blue"
                />

                <StatCard
                    title="Kabul Edilenler"
                    value={counts.accepted}
                    subtitle="Toplam"
                    icon={<FaCheck />}
                    color="green"
                />

                <StatCard
                    title="Reddedilenler"
                    value={counts.rejected}
                    subtitle="Toplam"
                    icon={<FaTimes />}
                    color="red"
                />
            </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_430px]">
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 shadow-[0_0_40px_rgba(15,23,42,0.45)]">
                    <div className="border-b border-white/10 bg-slate-900/40 p-4">
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.3fr_0.9fr_0.75fr_0.75fr_auto]">
                            <div className="flex h-[46px] items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 shadow-inner shadow-black/20 transition focus-within:border-blue-400/50">
                                <FaSearch className="text-slate-500" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ad, soyad, e-posta, departman, pozisyon ara..."
                                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />
                            </div>

                            <CustomSelect
                                icon={<FaBriefcase />}
                                value={jobPostingFilter}
                                onChange={(value) => setJobPostingFilter(value)}
                                options={[
                                    { value: "ALL", label: "Tüm iş ilanları" },
                                    ...jobPostings.map((job) => ({
                                        value: job.title,
                                        label: job.title,
                                    })),
                                ]}
                            />

                            <CustomSelect
                                icon={<FaFilter />}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as StatusFilter)}
                                options={[
                                    { value: "ALL", label: "Tüm durumlar" },
                                    { value: "PENDING", label: "Yeni" },
                                    { value: "ACCEPTED", label: "Kabul edildi" },
                                    { value: "REJECTED", label: "Reddedildi" },
                                ]}
                            />

                            <CustomSelect
                                icon={<FaCalendarAlt />}
                                value={sortFilter}
                                onChange={(value) => setSortFilter(value as SortFilter)}
                                options={[
                                    { value: "NEWEST", label: "En yeni" },
                                    { value: "OLDEST", label: "En eski" },
                                ]}
                            />

                            <button
                                onClick={clearFilters}
                                className="h-[46px] whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/80 px-4 text-sm font-semibold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                            >
                                Temizle
                            </button>
                        </div>

                        <div className="mt-3">
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 border-b border-white/10 px-4 pt-4">
                        <TabButton
                            active={statusFilter === "ALL"}
                            onClick={() => setStatusFilter("ALL")}
                            label={`Tümü (${counts.total})`}
                        />
                        <TabButton
                            active={statusFilter === "PENDING"}
                            onClick={() => setStatusFilter("PENDING")}
                            label={`Yeni (${counts.pending})`}
                        />
                        <TabButton
                            active={statusFilter === "ACCEPTED"}
                            onClick={() => setStatusFilter("ACCEPTED")}
                            label={`Kabul (${counts.accepted})`}
                        />
                        <TabButton
                            active={statusFilter === "REJECTED"}
                            onClick={() => setStatusFilter("REJECTED")}
                            label={`Reddedildi (${counts.rejected})`}
                        />
                    </div>

                        <div className="min-h-0 flex-1 overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead>
                            <tr className="border-b border-white/10 text-left text-sm font-semibold text-slate-400">
                                <th className="px-4 py-4">Aday</th>
                                <th className="px-4 py-4">Pozisyon</th>
                                <th className="px-4 py-4">Departman</th>
                                <th className="px-4 py-4">Başvuru Tarihi</th>
                                <th className="px-4 py-4">Durum</th>
                                <th className="px-4 py-4 text-right">İşlemler</th>
                            </tr>
                            </thead>

                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-20 text-center text-slate-400">
                                        Başvurular yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-24 text-center">
                                        <FaFileAlt className="mx-auto mb-4 text-5xl text-slate-700" />
                                        <p className="text-sm font-semibold text-white">
                                            Henüz başvuru bulunmuyor
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Yeni başvurular geldiğinde burada listelenecek
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedApplications.map((app) => (
                                    <tr
                                        key={app.id}
                                        onClick={() => setSelectedApplication(app)}
                                        className={`cursor-pointer border-b border-white/10 transition hover:bg-slate-900/70 ${
                                            selectedApplication?.id === app.id
                                                ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/60"
                                                : ""
                                        }`}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    firstName={app.firstName}
                                                    lastName={app.lastName}
                                                />

                                                <div>
                                                    <p className="font-semibold text-white">
                                                        {app.firstName} {app.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {app.email}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {app.phone || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-white">
                                                {app.positionName || "-"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-300">
                                            {app.departmentName || "-"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-white">
                                                {formatDate(app.appliedAt || app.createdAt)}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusClass(app.status)}`}
                                            >
                                                {getStatusLabel(app.status)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openCvModal(app);
                                                    }}
                                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-300 transition hover:bg-blue-500/20 hover:text-blue-300"
                                                    title="CV görüntüle"
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmAction({
                                                            type: "DOWNLOAD",
                                                            application: app,
                                                        });
                                                    }}
                                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-300 transition hover:bg-blue-500/20 hover:text-blue-300"
                                                    title="CV indir"
                                                >
                                                    <FaDownload />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedApplication(app);
                                                    }}
                                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-slate-300 transition hover:bg-blue-500/20 hover:text-blue-300"
                                                    title="Detay"
                                                >
                                                    <FaChevronRight />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        totalItems={filteredApplications.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(value) => {
                            setPageSize(value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <ApplicationDetailPanel
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onOpenCv={openCvModal}
                    onDownload={(app) =>
                        setConfirmAction({
                            type: "DOWNLOAD",
                            application: app,
                        })
                    }
                    onAccept={(app) =>
                        setConfirmAction({
                            type: "ACCEPT",
                            application: app,
                        })
                    }
                    onReject={(app) =>
                        setConfirmAction({
                            type: "REJECT",
                            application: app,
                        })
                    }
                    formatDate={formatDate}
                    getStatusLabel={getStatusLabel}
                />
            </div>

            <ConfirmModal
                action={confirmAction}
                onCancel={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
            />

            <CvPreviewModal
                application={cvModalApplication}
                cvUrl={cvUrl}
                loading={cvLoading}
                onClose={closeCvModal}
                onDownload={(app) =>
                    setConfirmAction({
                        type: "DOWNLOAD",
                        application: app,
                    })
                }
            />
        </div>
        </div>
    );
};

const CustomSelect = ({
                          icon,
                          value,
                          onChange,
                          options,
                      }: {
    icon: ReactNode;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const selectedOption =
        options.find((option) => option.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex h-[46px] w-full items-center gap-3 rounded-xl border px-4 text-left shadow-inner shadow-black/20 transition ${
                    open
                        ? "border-blue-400/50 bg-slate-900"
                        : "border-white/10 bg-slate-900/80 hover:border-blue-400/30"
                }`}
            >
                <span className="shrink-0 text-slate-400">{icon}</span>

                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {selectedOption?.label}
                </span>

                <FaChevronRight
                    className={`shrink-0 text-xs text-slate-500 transition ${
                        open ? "-rotate-90 text-blue-300" : "rotate-90"
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-[0_25px_70px_rgba(0,0,0,0.65)]">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {options.map((option) => {
                            const active = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                        active
                                            ? "bg-blue-500/15 text-blue-300"
                                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                                    }`}
                                >
                                    <span className="truncate">{option.label}</span>

                                    {active && (
                                        <span className="ml-3 h-2 w-2 rounded-full bg-blue-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const DateRangePicker = ({
                             startDate,
                             endDate,
                             setStartDate,
                             setEndDate,
                         }: {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
}) => {
    const startPickerRef = useRef<DatePicker | null>(null);
    const endPickerRef = useRef<DatePicker | null>(null);

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
                onClick={() => startPickerRef.current?.setOpen(true)}
                className="flex h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 shadow-inner shadow-black/20 transition hover:border-blue-400/30"
            >
                <FaCalendarAlt className="shrink-0 text-slate-400" />

                <DatePicker
                    ref={startPickerRef}
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Başlangıç tarihi seç"
                    className="w-full cursor-pointer bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                    calendarClassName="staffly-datepicker"
                    popperClassName="staffly-datepicker-popper"
                    isClearable
                    autoComplete="new-password"
                    name="staffly-application-start-date-filter"
                />
            </div>

            <div
                onClick={() => endPickerRef.current?.setOpen(true)}
                className="flex h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 shadow-inner shadow-black/20 transition hover:border-blue-400/30"
            >
                <FaCalendarAlt className="shrink-0 text-slate-400" />

                <DatePicker
                    ref={endPickerRef}
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Bitiş tarihi seç"
                    className="w-full cursor-pointer bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                    calendarClassName="staffly-datepicker"
                    popperClassName="staffly-datepicker-popper"
                    isClearable
                    autoComplete="new-password"
                    name="staffly-application-end-date-filter"
                />
            </div>

            <style>
                {`
                    .staffly-datepicker {
                        border: 1px solid rgba(255,255,255,0.12) !important;
                        background: #020617 !important;
                        color: white !important;
                        border-radius: 18px !important;
                        overflow: hidden !important;
                        box-shadow: 0 30px 80px rgba(0,0,0,0.55) !important;
                    }

                    .staffly-datepicker .react-datepicker__header {
                        background: #0f172a !important;
                        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                    }

                    .staffly-datepicker .react-datepicker__current-month,
                    .staffly-datepicker .react-datepicker-time__header,
                    .staffly-datepicker .react-datepicker-year-header,
                    .staffly-datepicker .react-datepicker__day-name {
                        color: white !important;
                    }

                    .staffly-datepicker .react-datepicker__day {
                        color: #cbd5e1 !important;
                        border-radius: 10px !important;
                    }

                    .staffly-datepicker .react-datepicker__day:hover {
                        background: rgba(37,99,235,0.25) !important;
                    }

                    .staffly-datepicker .react-datepicker__day--selected,
                    .staffly-datepicker .react-datepicker__day--keyboard-selected,
                    .staffly-datepicker .react-datepicker__day--in-range {
                        background: #2563eb !important;
                        color: white !important;
                    }

                    .staffly-datepicker .react-datepicker__day--disabled {
                        color: #475569 !important;
                    }

                    .staffly-datepicker-popper {
                        z-index: 9999 !important;
                    }

                    .react-datepicker__close-icon::after {
                        background: rgba(37,99,235,0.9) !important;
                    }
                `}
            </style>
        </div>
    );
};

const StatCard = ({
                      title,
                      value,
                      subtitle,
                      icon,
                      color,
                  }: {
    title: string;
    value: number;
    subtitle: string;
    icon: ReactNode;
    color: "blue" | "green" | "red";
}) => {
    const styles = {
        blue: {
            card: "border-blue-400/20 bg-blue-500/10",
            circle: "from-blue-600 to-blue-400 shadow-[0_0_35px_rgba(37,99,235,0.45)]",
            halo: "bg-blue-500/20",
            badge: "bg-blue-500/15 text-blue-300",
        },
        green: {
            card: "border-emerald-400/20 bg-emerald-500/10",
            circle: "from-emerald-600 to-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.45)]",
            halo: "bg-emerald-500/20",
            badge: "bg-emerald-500/15 text-emerald-300",
        },
        red: {
            card: "border-rose-400/20 bg-rose-500/10",
            circle: "from-rose-600 to-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.45)]",
            halo: "bg-rose-500/20",
            badge: "bg-rose-500/15 text-rose-300",
        },
    };

    const selected = styles[color];

    return (
        <div className={`rounded-2xl border p-5 ${selected.card}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${selected.halo}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selected.circle} text-lg text-white`}>
                            {icon}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
                        <p className="text-xs text-slate-400">{subtitle}</p>
                    </div>
                </div>

                <span className={`rounded-lg px-3 py-1 text-xs font-bold ${selected.badge}`}>
                    {value}
                </span>
            </div>
        </div>
    );
};
const TabButton = ({
                       active,
                       onClick,
                       label,
                   }: {
    active: boolean;
    onClick: () => void;
    label: string;
}) => {
    return (
        <button
            onClick={onClick}
            className={`border-b-2 pb-3 text-sm font-semibold transition ${
                active
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
            }`}
        >
            {label}
        </button>
    );
};

const Pagination = ({
                        totalItems,
                        currentPage,
                        totalPages,
                        pageSize,
                        onPageChange,
                        onPageSizeChange,
                    }: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}) => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    const visiblePages = pages.filter((page) => {
        if (totalPages <= 5) return true;
        if (page === 1 || page === totalPages) return true;
        return Math.abs(page - currentPage) <= 1;
    });

    return (
        <div className="flex flex-col gap-4 border-t border-white/10 px-4 py-4 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
            <div>
                Toplam <span className="font-semibold text-white">{totalItems}</span> başvuru
            </div>

            <div className="flex items-center justify-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaAngleDoubleLeft />
                </button>

                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaChevronLeft />
                </button>

                {visiblePages.map((page, index) => {
                    const previousPage = visiblePages[index - 1];
                    const showDots = previousPage && page - previousPage > 1;

                    return (
                        <div key={page} className="flex items-center gap-2">
                            {showDots && (
                                <span className="px-2 text-slate-500">...</span>
                            )}

                            <button
                                onClick={() => onPageChange(page)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                                    currentPage === page
                                        ? "border-blue-400 bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.45)]"
                                        : "border-white/10 bg-slate-900 text-slate-300 hover:bg-blue-500/20"
                                }`}
                            >
                                {page}
                            </button>
                        </div>
                    );
                })}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaChevronRight />
                </button>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaAngleDoubleRight />
                </button>
            </div>

            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-300 outline-none"
            >
                <option value={5} className="bg-slate-950">5 / sayfa</option>
                <option value={10} className="bg-slate-950">10 / sayfa</option>
                <option value={20} className="bg-slate-950">20 / sayfa</option>
                <option value={50} className="bg-slate-950">50 / sayfa</option>
            </select>
        </div>
    );
};

const Avatar = ({
                    firstName,
                    lastName,
                }: {
    firstName: string;
    lastName: string;
}) => {
    return (
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-white">
            {firstName?.[0]}
            {lastName?.[0]}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
        </div>
    );
};

const ApplicationDetailPanel = ({
                                    application,
                                    onClose,
                                    onOpenCv,
                                    onDownload,
                                    onAccept,
                                    onReject,
                                    formatDate,
                                    getStatusLabel,
                                }: {
    application: Application | null;
    onClose: () => void;
    onOpenCv: (application: Application) => void;
    onDownload: (application: Application) => void;
    onAccept: (application: Application) => void;
    onReject: (application: Application) => void;
    formatDate: (date?: string) => string;
    getStatusLabel: (status: string) => string;
}) => {
    if (!application) {
        return (
            <div className="h-full rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-center text-slate-400">
                Detay görmek için bir başvuru seç.
            </div>
        );
    }

    const isPending = application.status === "PENDING";

    return (
        <aside className="h-full rounded-2xl border border-white/10 bg-slate-950/75 p-5 shadow-[0_0_40px_rgba(15,23,42,0.45)]">
            <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        firstName={application.firstName}
                        lastName={application.lastName}
                    />

                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {application.firstName} {application.lastName}
                        </h2>

                        <p className="text-sm text-blue-400">
                            {application.positionName || "-"}
                        </p>

                        <span className="mt-2 inline-flex rounded-lg bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                            {getStatusLabel(application.status)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <FaTimes />
                </button>
            </div>

            <div className="space-y-3 border-b border-white/10 pb-5">
                <InfoLine icon={<FaEnvelope />} value={application.email} />
                <InfoLine icon={<FaPhone />} value={application.phone || "-"} />
                <InfoLine
                    icon={<FaCalendarAlt />}
                    value={formatDate(application.appliedAt || application.createdAt)}
                />
            </div>

            <div className="mt-5 border-b border-white/10 pb-5">
                <div className="mb-4 flex gap-6 text-sm">
                    <button className="border-b-2 border-blue-500 pb-2 font-semibold text-blue-400">
                        Özet
                    </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <h3 className="mb-4 text-sm font-bold text-white">
                        Başvuru Bilgileri
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <DetailItem
                            title="Başvuru Tarihi"
                            value={formatDate(application.appliedAt || application.createdAt)}
                        />
                        <DetailItem
                            title="Başvurduğu Pozisyon"
                            value={application.positionName}
                        />
                        <DetailItem
                            title="Departman"
                            value={application.departmentName}
                        />
                        <DetailItem
                            title="Alt Departman"
                            value={application.subDepartmentName}
                        />
                        <DetailItem
                            title="Durum"
                            value={getStatusLabel(application.status)}
                        />
                        <DetailItem
                            title="Başvuru No"
                            value={`REF-${String(application.id).padStart(4, "0")}`}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <h3 className="mb-4 text-sm font-bold text-white">Hızlı İşlemler</h3>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled={!isPending}
                        onClick={() => onAccept(application)}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            isPending
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                : "cursor-not-allowed border-white/10 bg-slate-800/60 text-slate-500"
                        }`}
                    >
                        Kabul Et
                    </button>

                    <button
                        onClick={() => onOpenCv(application)}
                        className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                        CV Görüntüle
                    </button>

                    <button
                        onClick={() => onDownload(application)}
                        className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                        CV İndir
                    </button>

                    <button
                        disabled={!isPending}
                        onClick={() => onReject(application)}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            isPending
                                ? "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                : "cursor-not-allowed border-white/10 bg-slate-800/60 text-slate-500"
                        }`}
                    >
                        Reddet
                    </button>
                </div>

                {!isPending && (
                    <p className="mt-3 text-xs text-slate-500">
                        Bu başvuru sonuçlandırıldığı için tekrar onaylanamaz veya reddedilemez.
                    </p>
                )}
            </div>
        </aside>
    );
};

const ConfirmModal = ({
                          action,
                          onCancel,
                          onConfirm,
                      }: {
    action: ConfirmAction;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    if (!action) return null;

    const isAccept = action.type === "ACCEPT";
    const isReject = action.type === "REJECT";
    const isDownload = action.type === "DOWNLOAD";

    const title = isAccept
        ? "Başvuruyu kabul et"
        : isReject
            ? "Başvuruyu reddet"
            : "CV indir";

    const description = isAccept
        ? `${action.application.firstName} ${action.application.lastName} adlı adayın başvurusunu kabul etmek istiyor musunuz?`
        : isReject
            ? `${action.application.firstName} ${action.application.lastName} adlı adayın başvurusunu reddetmek istiyor musunuz?`
            : `${action.application.firstName} ${action.application.lastName} adlı adayın CV dosyasını indirmek istiyor musunuz?`;

    const confirmText = isAccept
        ? "Kabul Et"
        : isReject
            ? "Reddet"
            : "İndir";

    const confirmClass = isAccept
        ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
        : isReject
            ? "border-rose-400/30 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
            : "border-blue-400/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30";

    return (
        <div
            onClick={onCancel}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_70px_rgba(15,23,42,0.95)]"
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            {description}
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                        Vazgeç
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${confirmClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CvPreviewModal = ({
                            application,
                            cvUrl,
                            loading,
                            onClose,
                            onDownload,
                        }: {
    application: Application | null;
    cvUrl: string | null;
    loading: boolean;
    onClose: () => void;
    onDownload: (application: Application) => void;
}) => {
    if (!application) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_80px_rgba(15,23,42,0.95)]"
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {application.firstName} {application.lastName} - CV
                        </h2>
                        <p className="text-sm text-slate-400">
                            {application.positionName || "Başvuru CV dosyası"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {cvUrl && (
                            <>
                                <a
                                    href={cvUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                                >
                                    <FaExternalLinkAlt />
                                    Yeni Sekme
                                </a>

                                <button
                                    onClick={() => onDownload(application)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                                >
                                    <FaDownload />
                                    İndir
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 bg-slate-900/60">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            CV yükleniyor...
                        </div>
                    ) : cvUrl ? (
                        <iframe
                            src={cvUrl}
                            title="CV Görüntüleme"
                            className="h-full w-full"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            CV görüntülenemedi.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoLine = ({
                      icon,
                      value,
                  }: {
    icon: ReactNode;
    value: string;
}) => {
    return (
        <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="text-slate-500">{icon}</span>
            <span>{value}</span>
        </div>
    );
};

const DetailItem = ({
                        title,
                        value,
                    }: {
    title: string;
    value?: string | null;
}) => {
    return (
        <div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="mt-1 text-sm font-semibold text-white">{value || "-"}</p>
        </div>
    );
};

export default ApplicationPage;