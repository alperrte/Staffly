import { useEffect, useState } from "react";
import {
    getAllLeaves,
    createLeave,
    approveLeave,
    rejectLeave,
    getLeaveTypes,
} from "../../services/leaveService";

type Leave = {
    id: number;
    employeeId: number;
    leaveTypeName: string;
    startDatetime: string;
    endDatetime: string;
    status: string;
};

type LeaveType = {
    id: number;
    name: string;
};

type ManagerAction = "approve" | "reject";

function SectionTitle({ title, count }: { title: string; count: number }) {
    return (
        <div className="mb-3 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
                <span className="h-8 w-1 rounded-full bg-indigo-500" />
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                        {title}
                    </h2>
                    <p className="text-xs text-slate-400">Toplam {count} kayıt</p>
                </div>
            </div>
        </div>
    );
}

function EmptyRow({ message }: { message: string }) {
    return (
        <tr>
            <td
                colSpan={5}
                className="px-4 py-10 text-center text-sm text-slate-400"
            >
                {message}
            </td>
        </tr>
    );
}

const LeaveServicePage = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

    const [formData, setFormData] = useState({
        leaveTypeId: 0,
        startDate: "",
        endDate: "",
    });

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [timeError, setTimeError] = useState("");
    const [showConfirmCreate, setShowConfirmCreate] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [managerConfirm, setManagerConfirm] = useState<{
        action: ManagerAction;
        leaveId: number;
    } | null>(null);

    const formatName = (name: string) => {
        return name
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const formatDate = (datetime: string) => {
        return datetime.split("T")[0];
    };

    const formatTime = (datetime: string) => {
        if (datetime.includes("T00:00:00")) return "";
        return datetime.split("T")[1].slice(0, 5);
    };

    const isHalfDay =
        leaveTypes.find((t) => t.id === formData.leaveTypeId)?.name ===
        "YARIM_GUN_IZIN";

    const statusTr = (raw: string | undefined) => {
        const s = (raw ?? "").toUpperCase();
        if (s === "PENDING") return "Beklemede";
        if (s === "APPROVED") return "Onaylandı";
        if (s === "REJECTED") return "Reddedildi";
        return formatName(raw || "Bilinmiyor");
    };

    const fetchLeaves = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const data = await getAllLeaves(user?.employeeId || 1);
            setLeaves(data);
        } catch (error) {
            console.error("HATA:", error);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchLeaves();
            try {
                const types = await getLeaveTypes();
                setLeaveTypes(types);
            } catch (error) {
                console.error(error);
            }
        };
        void load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (isHalfDay && name === "startDate") {
            setFormData({
                ...formData,
                startDate: value,
                endDate: value,
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (isHalfDay) {
                if (!startTime || !endTime) {
                    setTimeError("Lütfen saat seçiniz");
                    return false;
                }
                if (endTime <= startTime) {
                    setTimeError("Bitiş saati başlangıçtan sonra olmalı");
                    return false;
                }
            }

            setTimeError("");

            await createLeave({
                employeeId: user?.employeeId || 1,
                leaveTypeId: formData.leaveTypeId,
                startDatetime: isHalfDay
                    ? `${formData.startDate}T${startTime}:00`
                    : `${formData.startDate}T00:00:00`,
                endDatetime: isHalfDay
                    ? `${formData.endDate}T${endTime}:00`
                    : `${formData.endDate}T00:00:00`,
                reason: "İzin talebi",
            });

            setFormData({
                leaveTypeId: 0,
                startDate: "",
                endDate: "",
            });
            setStartTime("");
            setEndTime("");
            setShowForm(false);
            await fetchLeaves();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const pending = leaves.filter(
        (l) => l.status?.toUpperCase() === "PENDING"
    );
    const approved = leaves.filter(
        (l) => l.status?.toUpperCase() === "APPROVED"
    );
    const rejected = leaves.filter(
        (l) => l.status?.toUpperCase() === "REJECTED"
    );

    const handleApprove = async (id: number) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            await approveLeave({
                leaveRequestId: id,
                managerId: user?.employeeId || 1,
                action: "APPROVED",
                comment: "Onaylandı",
            });
            await fetchLeaves();
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            await rejectLeave({
                leaveRequestId: id,
                managerId: user?.employeeId || 1,
                action: "REJECTED",
                comment: "Reddedildi",
            });
            await fetchLeaves();
        } catch (error) {
            console.error(error);
        }
    };

    const cardShell =
        "rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-xl shadow-black/20 ring-1 ring-white/5";

    const modalBackdrop =
        "fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm";

    const modalPanel = `${cardShell} w-full max-w-md p-6 text-center`;

    const renderTable = (data: Leave[], showActions = false) => (
        <div className={`overflow-hidden ${cardShell}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                    <thead className="bg-slate-950/60">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Çalışan</th>
                        <th className="px-4 py-3">İzin Türü</th>
                        <th className="px-4 py-3">Başlangıç</th>
                        <th className="px-4 py-3">Bitiş</th>
                        <th className="px-4 py-3">Durum</th>
                        {showActions && (
                            <th className="px-4 py-3 text-right">İşlem</th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                    {data.length === 0 ? (
                        <EmptyRow message="Bu listede kayıt bulunmuyor." />
                    ) : (
                        data.map((leave) => {
                            const st = leave.status?.toUpperCase() ?? "";
                            const badge =
                                st === "PENDING"
                                    ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                                    : st === "APPROVED"
                                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                                        : st === "REJECTED"
                                            ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                                            : "bg-slate-500/15 text-slate-300 ring-slate-500/30";
                            return (
                                <tr
                                    key={leave.id}
                                    className="transition-colors hover:bg-slate-800/40"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-100">
                                        #{leave.employeeId}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                        {formatName(leave.leaveTypeName)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                        <div>
                                            {formatDate(leave.startDatetime)}
                                        </div>
                                        {formatTime(leave.startDatetime) && (
                                            <div className="mt-1 text-xs font-semibold text-white">
                                                {formatTime(
                                                    leave.startDatetime
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-200">
                                        <div>
                                            {formatDate(leave.endDatetime)}
                                        </div>
                                        {formatTime(leave.endDatetime) && (
                                            <div className="mt-1 text-xs font-semibold text-white">
                                                {formatTime(
                                                    leave.endDatetime
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badge}`}
                                            >
                                                {statusTr(leave.status)}
                                            </span>
                                    </td>
                                    {showActions && (
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setManagerConfirm({
                                                            action: "approve",
                                                            leaveId: leave.id,
                                                        })
                                                    }
                                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                                                >
                                                    Onayla
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setManagerConfirm({
                                                            action: "reject",
                                                            leaveId: leave.id,
                                                        })
                                                    }
                                                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500"
                                                >
                                                    Reddet
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className={`${cardShell} p-6 sm:p-8`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                İzin Talepleri
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                                İzin taleplerinizi oluşturun, durumlarını takip edin ve süreçleri tek ekrandan yönetin.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForm((v) => !v)}
                            className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition ${
                                showForm
                                    ? "border border-slate-700 bg-slate-800 text-white hover:bg-slate-750"
                                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                            }`}
                        >
                            {showForm ? "Formu Kapat" : "İzin Talebi Oluştur"}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mb-6 rounded-lg border border-slate-700 bg-[#020617] p-4"
                    >
                        <h2 className="mb-3 text-lg text-white">
                            İzin Talebi Oluştur
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={formData.leaveTypeId || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        leaveTypeId: Number(e.target.value),
                                    })
                                }
                                className="rounded bg-slate-800 p-2 text-white"
                            >
                                <option value="">İzin Türü Seç</option>
                                {leaveTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {formatName(type.name)}
                                    </option>
                                ))}
                            </select>

                            <div className="col-span-2 flex gap-3">
                                <div className="flex w-full flex-col">
                                    <label className="mb-1 text-xs text-gray-400">
                                        Başlangıç Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="rounded bg-slate-800 p-2 text-white"
                                        min={today}
                                    />
                                </div>

                                <div className="flex w-full flex-col">
                                    <label className="mb-1 text-xs text-gray-400">
                                        Bitiş Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="rounded bg-slate-800 p-2 text-white"
                                        disabled={isHalfDay}
                                        min={formData.startDate || today}
                                    />
                                </div>
                            </div>

                            {isHalfDay && (
                                <div className="col-span-2 flex flex-col">
                                    {timeError && (
                                        <div className="mb-1 flex animate-pulse items-center gap-1 text-sm text-red-500">
                                            {timeError}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) =>
                                                setStartTime(e.target.value)
                                            }
                                            className="w-full rounded bg-slate-800 p-2 text-white"
                                        />

                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                if (
                                                    startTime &&
                                                    value <= startTime
                                                ) {
                                                    setTimeError(
                                                        "!Bitiş saati başlangıç saatinden önce olamaz."
                                                    );
                                                } else {
                                                    setTimeError("");
                                                }


                                                setEndTime(value);
                                            }}
                                            className="w-full rounded bg-slate-800 p-2 text-white"
                                            min={startTime}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowConfirmCreate(true)}
                            className="mt-3 rounded bg-green-600 px-4 py-2 text-white"
                        >
                            İzin Talebi Oluştur
                        </button>
                    </form>
                )}

                <div className="space-y-6">

                    {/* 🔥 TAB BUTTONS */}
                    <div className="flex gap-3">

                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                activeTab === "pending"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-300"
                            }`}
                        >
                            Bekleyen ({pending.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("approved")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                activeTab === "approved"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-300"
                            }`}
                        >
                            Onaylanan ({approved.length})
                        </button>

                        <button
                            onClick={() => setActiveTab("rejected")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                activeTab === "rejected"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-300"
                            }`}
                        >
                            Reddedilen ({rejected.length})
                        </button>

                    </div>

                    {/* 🔥 TEK TABLO GÖSTERİMİ */}

                    {activeTab === "pending" && (
                        <>
                            <SectionTitle title="Bekleyen İzinler" count={pending.length} />
                            {renderTable(pending, true)}
                        </>
                    )}

                    {activeTab === "approved" && (
                        <>
                            <SectionTitle title="Onaylanan İzinler" count={approved.length} />
                            {renderTable(approved)}
                        </>
                    )}

                    {activeTab === "rejected" && (
                        <>
                            <SectionTitle title="Reddedilen İzinler" count={rejected.length} />
                            {renderTable(rejected)}
                        </>
                    )}

                </div>
            </div>

            {showConfirmCreate && (
                <div className={modalBackdrop} role="presentation">
                    <div
                        className={modalPanel}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-create-title"
                    >
                        <h3
                            id="confirm-create-title"
                            className="text-lg font-semibold text-white"
                        >
                            İzin talebi oluşturulsun mu?
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Onayladığınızda talep sisteme iletilecek.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={async () => {
                                    setShowConfirmCreate(false);
                                    const success = await handleSubmit();
                                    if (success) setShowSuccessModal(true);
                                }}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
                            >
                                Tamam
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmCreate(false)}
                                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className={modalBackdrop} role="presentation">
                    <div
                        className={modalPanel}
                        role="dialog"
                        aria-modal="true"
                    >
                        <h3 className="text-lg font-semibold text-white">
                            İzin talebiniz oluşturuldu
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Talebiniz listeye eklendi.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {managerConfirm && (
                <div className={modalBackdrop} role="presentation">
                    <div
                        className={modalPanel}
                        role="dialog"
                        aria-modal="true"
                    >
                        <h3 className="text-lg font-semibold text-white">
                            {managerConfirm.action === "approve"
                                ? "İzin talebini onaylamak istediğinize emin misiniz?"
                                : "İzin talebinizi reddetmek istediğinize emin misiniz?"}
                        </h3>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={async () => {
                                    const id = managerConfirm.leaveId;
                                    const act = managerConfirm.action;
                                    setManagerConfirm(null);
                                    if (act === "approve") await handleApprove(id);
                                    else await handleReject(id);
                                }}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
                            >
                                Tamam
                            </button>
                            <button
                                type="button"
                                onClick={() => setManagerConfirm(null)}
                                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveServicePage;