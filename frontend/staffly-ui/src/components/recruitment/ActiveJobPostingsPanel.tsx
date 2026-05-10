import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { getActiveJobPostings } from "../../services/applicationService";
import type { JobPosting } from "../../types/loginPageTypes";
import JobPostingCard from "./JobPostingCard";
import JobDetailModal from "./JobDetailModal";
import JobApplicationModal from "./JobApplicationModal";

const ActiveJobPostingsPanel = () => {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [applicationModalOpen, setApplicationModalOpen] = useState(false);
    const [showAllJobs, setShowAllJobs] = useState(false);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getActiveJobPostings();
                setJobs(Array.isArray(data) ? data : []);
            } catch {
                setError("İlanlar yüklenirken bir sorun oluştu.");
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    const openJobDetail = (job: JobPosting) => {
        setSelectedJob(job);
        setDetailModalOpen(true);
        setApplicationModalOpen(false);
    };

    const closeJobDetail = () => {
        setDetailModalOpen(false);
    };

    const openApplicationModal = () => {
        setDetailModalOpen(false);
        setApplicationModalOpen(true);
    };

    const backToJobDetail = () => {
        setApplicationModalOpen(false);
        setDetailModalOpen(true);
    };

    const closeApplicationModal = () => {
        setApplicationModalOpen(false);
        setSelectedJob(null);
    };

    return (
        <>
            {detailModalOpen && selectedJob && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
                    onClick={closeJobDetail}
                >
                    <div
                        className="flex max-h-[92vh] w-full max-w-4xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <JobDetailModal
                            job={selectedJob}
                            onClose={closeJobDetail}
                            onApply={openApplicationModal}
                        />
                    </div>
                </div>
            )}

            {applicationModalOpen && selectedJob && (
                <div
                    className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
                    onClick={closeApplicationModal}
                >
                    <div
                        className="flex max-h-[92vh] w-full max-w-4xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <JobApplicationModal
                            job={selectedJob}
                            onClose={closeApplicationModal}
                            onBack={backToJobDetail}
                        />
                    </div>
                </div>
            )}

            <div className="w-full rounded-[2rem] border border-white/15 bg-slate-950/45 p-8 shadow-[0_0_70px_rgba(15,23,42,0.88)] backdrop-blur-2xl lg:p-10">
                <h2 className="text-[1.65rem] font-bold text-white">
                    Aktif İş İlanları
                </h2>

                <div className="mt-7">
                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-900/30 py-16 text-center text-sm text-slate-400">
                            İlanlar yükleniyor...
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
                            {error}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/30 py-16 text-center">
                            <BriefcaseBusiness className="mb-4 h-12 w-12 text-slate-500" />
                            <p className="text-sm text-slate-300">
                                Henüz yayında aktif ilan bulunmuyor.
                            </p>
                        </div>
                    ) : (
                        <div className="staffly-scroll max-h-[420px] space-y-4 overflow-y-auto pr-1">
                            {(showAllJobs ? jobs : jobs.slice(0, 3)).map((job, index) => (
                                <JobPostingCard
                                    key={job.id}
                                    job={job}
                                    index={index}
                                    onClick={() => openJobDetail(job)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {jobs.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowAllJobs((prev) => !prev)}
                        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/30 py-4 text-base font-bold text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/10"
                    >
                        <BriefcaseBusiness className="h-5 w-5" />
                        {showAllJobs ? "Daha Az İlan Göster" : "Tüm İş İlanlarını Görüntüle"}
                        <ArrowRight
                            className={`h-5 w-5 transition ${showAllJobs ? "-rotate-90" : ""}`}
                        />
                    </button>
                )}
            </div>
        </>
    );
};

export default ActiveJobPostingsPanel;