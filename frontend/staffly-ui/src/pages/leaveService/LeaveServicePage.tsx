import { useEffect, useState } from "react";
import {
    getAllLeaves,
    createLeave,
    approveLeave,
    rejectLeave,
    getLeaveTypes
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

const LeaveServicePage = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

    const [formData, setFormData] = useState({
        leaveTypeId: 0,
        startDate: "",
        endDate: "",
    });

    const formatName = (name: string) => {
        return name
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
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

        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            await createLeave({
                employeeId: user?.employeeId || 1,
                leaveTypeId: formData.leaveTypeId,

                // 🔥 BACKEND FORMAT
                startDatetime: formData.startDate + "T00:00:00",
                endDatetime: formData.endDate + "T00:00:00",

                reason: "İzin talebi"
            });

            alert("İzin talebi oluşturuldu");

            setFormData({
                leaveTypeId: 0,
                startDate: "",
                endDate: "",
            });

            setShowForm(false);
            await fetchLeaves();

        } catch (error) {
            console.error(error);
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
                comment: "Onaylandı"
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
                comment: "Reddedildi"
            });

            await fetchLeaves();
        } catch (error) {
            console.error(error);
        }
    };

    const renderTable = (data: Leave[], showActions = false) => (
        <table className="min-w-full bg-[#020617] border border-slate-700 rounded-lg mb-6">
            <thead>
            <tr className="text-left text-gray-300 border-b border-slate-700">
                <th className="p-3">Çalışan</th>
                <th className="p-3">İzin Türü</th>
                <th className="p-3">Başlangıç Tarihi</th>
                <th className="p-3">Bitiş Tarihi</th>
                {showActions && <th className="p-3">İşlem</th>}
            </tr>
            </thead>

            <tbody>
            {data.map((leave) => (
                <tr
                    key={leave.id}
                    className="border-b border-slate-800 hover:bg-[#1E293B]"
                >
                    <td className="p-3">{leave.employeeId}</td>
                    <td className="p-3">{leave.leaveTypeName}</td>
                    <td className="p-3">{leave.startDatetime}</td>
                    <td className="p-3">{leave.endDatetime}</td>

                    {showActions && (
                        <td className="p-3 flex gap-2">
                            <button
                                onClick={() => handleApprove(leave.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                                Onayla
                            </button>

                            <button
                                onClick={() => handleReject(leave.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded"
                            >
                                Reddet
                            </button>
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-white">
                İzin Talepleri
            </h1>

            <button
                onClick={() => setShowForm(!showForm)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
                {showForm ? "Kapat" : "İzin Talebi Oluştur"}
            </button>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 bg-[#020617] p-4 rounded-lg border border-slate-700"
                >
                    <h2 className="text-lg text-white mb-3">
                        İzin Talebi Oluştur
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={formData.leaveTypeId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    leaveTypeId: Number(e.target.value)
                                })
                            }
                            className="p-2 rounded bg-slate-800 text-white"
                        >
                            <option value="">İzin Türü Seç</option>
                            {leaveTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {formatName(type.name)}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-3 col-span-2">
                            <div className="flex flex-col w-full">
                                <label className="text-xs text-gray-400 mb-1">
                                    Başlangıç Tarihi
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="p-2 rounded bg-slate-800 text-white"
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <label className="text-xs text-gray-400 mb-1">
                                    Bitiş Tarihi
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="p-2 rounded bg-slate-800 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-3 px-4 py-2 bg-green-600 rounded text-white"
                    >
                        İzin Talebi Oluştur
                    </button>
                </form>
            )}

            <h2 className="text-white mb-2">Bekleyen İzinler</h2>
            {renderTable(pending, true)}

            <h2 className="text-white mb-2">Onaylanan İzinler</h2>
            {renderTable(approved)}

            <h2 className="text-white mb-2">Reddedilen İzinler</h2>
            {renderTable(rejected)}
        </div>
    );
};

export default LeaveServicePage;