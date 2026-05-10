import { useEffect, useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    CalendarDays,
    FileText,
    Info,
    MapPin,
    Save,
    X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { tr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import type { JobPosting, Position } from "../../types/cvServiceTypes";
import { TURKEY_LOCATIONS } from "../../constants/turkeyLocations";

type LocationType = "CITY" | "REMOTE";

type JobPostingFormState = {
    title: string;
    description: string;
    positionId: string;
    experienceLevel: string;
    employmentType: string;
    workModel: string;
    location: string;
    requirements: string;
    responsibilities: string;
    benefits: string;
    teamInfo: string;
    status: string;
    applicationDeadline: string;
};

export type JobPostingPayload = {
    title: string;
    description: string;
    positionId: number;
    experienceLevel: string;
    employmentType: string;
    workModel: string;
    location: string;
    requirements: string | null;
    responsibilities: string | null;
    benefits: string | null;
    teamInfo: string | null;
    status: string;
    applicationDeadline: string | null;
};

const emptyForm: JobPostingFormState = {
    title: "",
    description: "",
    positionId: "",
    experienceLevel: "",
    employmentType: "FULL_TIME",
    workModel: "HYBRID",
    location: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    teamInfo: "",
    status: "ACTIVE",
    applicationDeadline: "",
};

const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const parseInputDate = (date?: string) => {
    if (!date) return null;

    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
};

const optionalText = (value: string) => {
    const cleaned = value.trim();
    return cleaned ? cleaned : null;
};

const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const parseLocation = (location?: string) => {
    const cleaned = location?.trim();

    if (!cleaned) {
        return {
            type: "CITY" as LocationType,
            city: "",
            district: "",
        };
    }

    if (cleaned.toLowerCase() === "remote") {
        return {
            type: "REMOTE" as LocationType,
            city: "",
            district: "",
        };
    }

    const [city = "", district = ""] = cleaned.split("/").map((item) => item.trim());

    return {
        type: "CITY" as LocationType,
        city,
        district,
    };
};

const buildLocationValue = (
    locationType: LocationType,
    city: string,
    district: string
) => {
    if (locationType === "REMOTE") return "Remote";

    const cleanedCity = city.trim();
    const cleanedDistrict = district.trim();

    if (!cleanedCity) return "";
    if (!cleanedDistrict) return cleanedCity;

    return `${cleanedCity} / ${cleanedDistrict}`;
};

const mapJobToForm = (job: JobPosting): JobPostingFormState => {
    return {
        title: job.title || "",
        description: job.description || "",
        positionId: job.positionId ? String(job.positionId) : "",
        experienceLevel: job.experienceLevel || "",
        employmentType: job.employmentType || "FULL_TIME",
        workModel: job.workModel || "HYBRID",
        location: job.location || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        benefits: job.benefits || "",
        teamInfo: job.teamInfo || "",
        status: job.status === "CLOSED" ? "ACTIVE" : job.status || "ACTIVE",
        applicationDeadline: job.applicationDeadline || "",
    };
};

const buildPayload = (form: JobPostingFormState): JobPostingPayload => {
    return {
        title: form.title.trim(),
        description: form.description.trim(),
        positionId: Number(form.positionId),
        experienceLevel: form.experienceLevel.trim(),
        employmentType: form.employmentType,
        workModel: form.workModel,
        location: form.location.trim(),
        requirements: optionalText(form.requirements),
        responsibilities: optionalText(form.responsibilities),
        benefits: optionalText(form.benefits),
        teamInfo: optionalText(form.teamInfo),
        status: form.status,
        applicationDeadline: form.applicationDeadline || null,
    };
};

type Props = {
    open: boolean;
    positions: Position[];
    draftJobs: JobPosting[];
    editingJob: JobPosting | null;
    saving: boolean;
    onClose: () => void;
    onSubmit: (
        payload: JobPostingPayload,
        editingJob: JobPosting | null
    ) => Promise<void>;
};

const JobPostingFormModal = ({
                                 open,
                                 positions,
                                 draftJobs,
                                 editingJob,
                                 saving,
                                 onClose,
                                 onSubmit,
                             }: Props) => {
    const [form, setForm] = useState<JobPostingFormState>(emptyForm);
    const [error, setError] = useState("");
    const [selectedDraftId, setSelectedDraftId] = useState("");

    const [locationType, setLocationType] = useState<LocationType>("CITY");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const isEditMode = Boolean(editingJob);

    const cityOptions = useMemo(() => {
        return TURKEY_LOCATIONS.map((item) => item.city);
    }, []);

    const districtOptions = useMemo(() => {
        return (
            TURKEY_LOCATIONS.find((item) => item.city === selectedCity)?.districts || []
        );
    }, [selectedCity]);

    const selectedDeadline = useMemo(() => {
        return parseInputDate(form.applicationDeadline);
    }, [form.applicationDeadline]);

    useEffect(() => {
        if (!open) return;

        const nextForm = editingJob ? mapJobToForm(editingJob) : emptyForm;
        const parsedLocation = parseLocation(nextForm.location);

        setForm(nextForm);
        setSelectedDraftId("");
        setLocationType(parsedLocation.type);
        setSelectedCity(parsedLocation.city);
        setSelectedDistrict(parsedLocation.district);
        setError("");
    }, [open, editingJob]);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            location: buildLocationValue(locationType, selectedCity, selectedDistrict),
        }));
    }, [locationType, selectedCity, selectedDistrict]);

    if (!open) return null;

    const setField = (name: keyof JobPostingFormState, value: string) => {
        if (name === "experienceLevel") {
            value = value.replace(/[^0-9-]/g, "");
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDraftSelect = (draftId: string) => {
        setSelectedDraftId(draftId);

        if (!draftId) {
            setForm(emptyForm);
            setLocationType("CITY");
            setSelectedCity("");
            setSelectedDistrict("");
            return;
        }

        const selectedDraft = draftJobs.find((job) => String(job.id) === draftId);

        if (!selectedDraft) return;

        const nextForm = {
            ...mapJobToForm(selectedDraft),
            status: "ACTIVE",
        };

        const parsedLocation = parseLocation(nextForm.location);

        setForm(nextForm);
        setLocationType(parsedLocation.type);
        setSelectedCity(parsedLocation.city);
        setSelectedDistrict(parsedLocation.district);
    };

    const validate = () => {
        if (!form.title.trim()) {
            setError("İlan başlığı zorunludur.");
            return false;
        }

        if (!form.description.trim()) {
            setError("İlan açıklaması zorunludur.");
            return false;
        }

        if (!form.positionId) {
            setError("Pozisyon seçimi zorunludur.");
            return false;
        }

        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const selectedDraft =
            draftJobs.find((job) => String(job.id) === selectedDraftId) || null;

        await onSubmit(buildPayload(form), editingJob || selectedDraft);
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-sky-400/30 bg-[#030817]/95 shadow-[0_0_70px_rgba(37,99,235,0.24)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-7 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 shadow-[0_0_28px_rgba(37,99,235,0.28)]">
                            {isEditMode ? (
                                <Save className="h-7 w-7" />
                            ) : (
                                <FileText className="h-7 w-7" />
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {isEditMode
                                    ? "İş İlanını Düzenle"
                                    : "Yeni İş İlanı Oluştur"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {isEditMode
                                    ? "Seçili ilanın bilgilerini güncelleyin."
                                    : "HR tarafından yayınlanacak açık pozisyon bilgilerini girin."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6">
                        {error && (
                            <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
                                {error}
                            </div>
                        )}

                        <section className="mb-5 rounded-[1.5rem] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-slate-900/35 to-slate-950/50 p-5 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
                            <SectionTitle
                                icon={<BriefcaseBusiness className="h-5 w-5" />}
                                title="Temel Bilgiler"
                                description="İlan başlığı, pozisyon ve genel açıklama alanlarını doldurun."
                                color="sky"
                            />

                            {!isEditMode && draftJobs.length > 0 && (
                                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                                    <FormField label="Taslak İlan Seç">
                                        <select
                                            value={selectedDraftId}
                                            onChange={(e) =>
                                                handleDraftSelect(e.target.value)
                                            }
                                            className="staffly-job-input"
                                        >
                                            <option value="">Yeni ilan olarak devam et</option>

                                            {draftJobs.map((draft) => (
                                                <option key={draft.id} value={draft.id}>
                                                    {draft.title}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <p className="mt-2 text-xs leading-5 text-amber-100/70">
                                        Bir taslak seçerseniz form alanları otomatik dolar.
                                        Kaydettiğinizde seçili taslak güncellenir ve aktif ilana dönüşür.
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField label="İlan Başlığı">
                                    <input
                                        value={form.title}
                                        onChange={(e) => setField("title", e.target.value)}
                                        placeholder="Örn: Yazılım Geliştirici"
                                        className="staffly-job-input"
                                    />
                                </FormField>

                                <FormField label="Pozisyon">
                                    <select
                                        value={form.positionId}
                                        onChange={(e) =>
                                            setField("positionId", e.target.value)
                                        }
                                        className="staffly-job-input"
                                    >
                                        <option value="">Pozisyon seçiniz</option>

                                        {positions.map((position) => (
                                            <option key={position.id} value={position.id}>
                                                {position.name || position.positionName}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <div className="mt-4">
                                <FormField label="İlan Açıklaması">
                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setField("description", e.target.value)
                                        }
                                        rows={4}
                                        placeholder="Pozisyonun genel açıklamasını girin..."
                                        className="staffly-job-input resize-none"
                                    />
                                </FormField>
                            </div>
                        </section>

                        <section className="mb-5 rounded-[1.5rem] border border-blue-400/15 bg-gradient-to-br from-blue-500/8 via-slate-900/30 to-slate-950/50 p-5">
                            <SectionTitle
                                icon={<Info className="h-5 w-5" />}
                                title="Çalışma Detayları"
                                description="Çalışma tipi, model, konum, tecrübe ve son başvuru bilgilerini girin."
                                color="blue"
                            />

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <FormField label="Tecrübe">
                                    <input
                                        value={form.experienceLevel}
                                        onChange={(e) =>
                                            setField("experienceLevel", e.target.value)
                                        }
                                        placeholder="1-3"
                                        className="staffly-job-input"
                                    />
                                </FormField>

                                <FormField label="Çalışma Tipi">
                                    <select
                                        value={form.employmentType}
                                        onChange={(e) =>
                                            setField("employmentType", e.target.value)
                                        }
                                        className="staffly-job-input"
                                    >
                                        <option value="FULL_TIME">Tam Zamanlı</option>
                                        <option value="PART_TIME">Yarı Zamanlı</option>
                                        <option value="INTERNSHIP">Staj</option>
                                        <option value="CONTRACT">Sözleşmeli</option>
                                    </select>
                                </FormField>

                                <FormField label="Çalışma Modeli">
                                    <select
                                        value={form.workModel}
                                        onChange={(e) =>
                                            setField("workModel", e.target.value)
                                        }
                                        className="staffly-job-input"
                                    >
                                        <option value="ON_SITE">Ofis</option>
                                        <option value="REMOTE">Uzaktan</option>
                                        <option value="HYBRID">Hibrit</option>
                                    </select>
                                </FormField>

                                <FormField label="Durum">
                                    <select
                                        value={form.status}
                                        onChange={(e) => setField("status", e.target.value)}
                                        className="staffly-job-input"
                                    >
                                        <option value="ACTIVE">Aktif Yayınla</option>
                                        <option value="DRAFT">Taslak Kaydet</option>
                                    </select>
                                </FormField>

                                <FormField label="Son Başvuru (Opsiyonel)">
                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <DatePicker
                                            selected={selectedDeadline}
                                            onChange={(date) => {
                                                if (date instanceof Date) {
                                                    setField(
                                                        "applicationDeadline",
                                                        toInputDate(date)
                                                    );
                                                } else {
                                                    setField("applicationDeadline", "");
                                                }
                                            }}
                                            minDate={getTodayStart()}
                                            dateFormat="dd MMMM yyyy"
                                            locale={tr}
                                            placeholderText="Tarih seçiniz"
                                            isClearable
                                            wrapperClassName="w-full"
                                            popperClassName="staffly-datepicker-popper"
                                            calendarClassName="staffly-datepicker"
                                            className="staffly-job-input staffly-date-input w-full"
                                        />
                                    </div>
                                </FormField>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                                <SectionTitle
                                    icon={<MapPin className="h-5 w-5" />}
                                    title="Konum Bilgisi"
                                    description="Konum alanı opsiyoneldir. Remote seçebilir veya il/ilçe belirtebilirsiniz."
                                    color="violet"
                                    compact
                                />

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[0.7fr_1fr_1fr]">
                                    <FormField label="Konum Tipi">
                                        <select
                                            value={locationType}
                                            onChange={(e) => {
                                                const nextType = e.target.value as LocationType;

                                                setLocationType(nextType);

                                                if (nextType === "REMOTE") {
                                                    setSelectedCity("");
                                                    setSelectedDistrict("");
                                                }
                                            }}
                                            className="staffly-job-input"
                                        >
                                            <option value="CITY">İl / İlçe</option>
                                            <option value="REMOTE">Remote</option>
                                        </select>
                                    </FormField>

                                    <FormField label="İl">
                                        <select
                                            value={selectedCity}
                                            disabled={locationType === "REMOTE"}
                                            onChange={(e) => {
                                                setSelectedCity(e.target.value);
                                                setSelectedDistrict("");
                                            }}
                                            className="staffly-job-input disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">İl seçiniz</option>

                                            {cityOptions.map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="İlçe (Opsiyonel)">
                                        <select
                                            value={selectedDistrict}
                                            disabled={
                                                locationType === "REMOTE" || !selectedCity
                                            }
                                            onChange={(e) =>
                                                setSelectedDistrict(e.target.value)
                                            }
                                            className="staffly-job-input disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">
                                                {selectedCity
                                                    ? "İlçe seçiniz"
                                                    : "Önce il seçiniz"}
                                            </option>

                                            {districtOptions.map((district) => (
                                                <option key={district} value={district}>
                                                    {district}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[1.5rem] border border-violet-400/15 bg-gradient-to-br from-violet-500/8 via-slate-900/30 to-slate-950/50 p-5">
                            <SectionTitle
                                icon={<FileText className="h-5 w-5" />}
                                title="İlan İçeriği"
                                description="Bu alanlar opsiyoneldir. Boş bırakırsanız sisteme null olarak gönderilir."
                                color="violet"
                            />

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField label="Beklenenler (Opsiyonel)">
                                    <textarea
                                        value={form.requirements}
                                        onChange={(e) =>
                                            setField("requirements", e.target.value)
                                        }
                                        rows={4}
                                        placeholder="Adaydan beklenen yetkinlikleri yazın..."
                                        className="staffly-job-input resize-none"
                                    />
                                </FormField>

                                <FormField label="Yapılacak İşler (Opsiyonel)">
                                    <textarea
                                        value={form.responsibilities}
                                        onChange={(e) =>
                                            setField("responsibilities", e.target.value)
                                        }
                                        rows={4}
                                        placeholder="Bu pozisyondaki sorumlulukları yazın..."
                                        className="staffly-job-input resize-none"
                                    />
                                </FormField>

                                <FormField label="Yan Haklar (Opsiyonel)">
                                    <textarea
                                        value={form.benefits}
                                        onChange={(e) => setField("benefits", e.target.value)}
                                        rows={4}
                                        placeholder="Yemek, ulaşım, hibrit çalışma vb."
                                        className="staffly-job-input resize-none"
                                    />
                                </FormField>

                                <FormField label="Ekip Bilgisi (Opsiyonel)">
                                    <textarea
                                        value={form.teamInfo}
                                        onChange={(e) => setField("teamInfo", e.target.value)}
                                        rows={4}
                                        placeholder="Adayın katılacağı ekip hakkında bilgi..."
                                        className="staffly-job-input resize-none"
                                    />
                                </FormField>
                            </div>
                        </section>
                    </div>

                    <div className="flex shrink-0 gap-3 border-t border-white/10 bg-slate-950/95 px-7 py-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Vazgeç
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_38px_rgba(37,99,235,0.35)] transition hover:opacity-90 disabled:opacity-60"
                        >
                            {saving
                                ? "Kaydediliyor..."
                                : isEditMode
                                    ? "Değişiklikleri Kaydet"
                                    : selectedDraftId
                                        ? "Taslağı Yayınla"
                                        : form.status === "DRAFT"
                                            ? "Taslak Kaydet"
                                            : "İlan Oluştur"}
                        </button>
                    </div>
                </form>

                <style>
                    {`
                        .staffly-job-input {
                            width: 100%;
                            border-radius: 0.875rem;
                            border: 1px solid rgba(255,255,255,0.10);
                            background: rgba(15,23,42,0.78);
                            padding: 0.85rem 1rem;
                            color: white;
                            font-size: 0.875rem;
                            outline: none;
                            min-height: 46px;
                        }

                        .staffly-job-input::placeholder {
                            color: rgb(100 116 139);
                        }

                        .staffly-job-input:focus {
                            border-color: rgba(56,189,248,0.65);
                            box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
                        }

                        .staffly-job-input option {
                            background: #020617;
                            color: white;
                        }

                        .react-datepicker-wrapper,
                        .react-datepicker__input-container {
                            width: 100%;
                        }

                        .staffly-datepicker-popper {
                            z-index: 99999 !important;
                        }

                        .staffly-datepicker {
                            border: 1px solid rgba(56, 189, 248, 0.25) !important;
                            border-radius: 18px !important;
                            overflow: hidden !important;
                            background: #020617 !important;
                            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.65) !important;
                            font-family: inherit !important;
                        }

                        .staffly-datepicker .react-datepicker__header {
                            background: #0f172a !important;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                        }

                        .staffly-datepicker .react-datepicker__current-month,
                        .staffly-datepicker .react-datepicker-time__header,
                        .staffly-datepicker-year-header {
                            color: white !important;
                            font-weight: 800 !important;
                        }

                        .staffly-datepicker .react-datepicker__day-name,
                        .staffly-datepicker .react-datepicker__day,
                        .staffly-datepicker .react-datepicker__time-name {
                            color: #cbd5e1 !important;
                        }

                        .staffly-datepicker .react-datepicker__day:hover {
                            background: rgba(37, 99, 235, 0.25) !important;
                            border-radius: 10px !important;
                            color: white !important;
                        }

                        .staffly-datepicker .react-datepicker__day--selected,
                        .staffly-datepicker .react-datepicker__day--keyboard-selected {
                            background: linear-gradient(135deg, #38bdf8, #2563eb, #7c3aed) !important;
                            border-radius: 10px !important;
                            color: white !important;
                            font-weight: 800 !important;
                        }

                        .staffly-datepicker .react-datepicker__day--disabled {
                            color: #475569 !important;
                        }

                        .staffly-datepicker .react-datepicker__navigation-icon::before {
                            border-color: #cbd5e1 !important;
                        }

                        .react-datepicker__close-icon::after {
                            background: rgba(37, 99, 235, 0.9) !important;
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

const SectionTitle = ({
                          icon,
                          title,
                          description,
                          color,
                          compact = false,
                      }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: "sky" | "blue" | "violet";
    compact?: boolean;
}) => {
    const colorClass =
        color === "sky"
            ? "bg-sky-500/10 text-sky-300"
            : color === "blue"
                ? "bg-blue-500/10 text-blue-300"
                : "bg-violet-500/10 text-violet-300";

    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex ${
                    compact ? "h-9 w-9" : "h-10 w-10"
                } items-center justify-center rounded-xl ${colorClass}`}
            >
                {icon}
            </div>

            <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
        </div>
    );
};

const FormField = ({
                       label,
                       children,
                   }: {
    label: string;
    children: React.ReactNode;
}) => {
    return (
        <label>
            <span className="mb-2 block text-xs font-bold text-slate-400">
                {label}
            </span>
            {children}
        </label>
    );
};

export default JobPostingFormModal;