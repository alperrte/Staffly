import { useEffect, useState } from "react";
import api from "../../services/api";

interface Application {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    status: string;
}

const CvServicePage = () => {
    const [applications, setApplications] = useState<Application[]>([]);

    const fetchApplications = async () => {
        const res = await api.get("http://localhost:8085/applications");
        setApplications(res.data);
    };

    const openCv = async (id: number) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:8085/applications/${id}/cv`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("CV alınamadı");
            }

            const blob = await response.blob();
            const fileUrl = window.URL.createObjectURL(blob);
            window.open(fileUrl, "_blank");
        } catch (error) {
            console.error("CV açma hatası:", error);
            alert("CV açılırken bir hata oluştu.");
        }
    };

    const updateStatus = async (id: number, status: string) => {
        await api.patch(
            `http://localhost:8085/applications/${id}/status?status=${status}`
        );
        fetchApplications();
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-6">Başvurular</h1>

            <table className="w-full text-sm bg-[#020617] border border-slate-800">
                <thead className="bg-[#1E293B]">
                <tr>
                    <th className="p-2">Ad</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Departman</th>
                    <th className="p-2">Pozisyon</th>
                    <th className="p-2">Durum</th>
                    <th className="p-2">Aksiyon</th>
                </tr>
                </thead>

                <tbody>
                {applications.map((app) => (
                    <tr key={app.id} className="border-t border-slate-800">
                        <td className="p-2">
                            {app.firstName} {app.lastName}
                        </td>
                        <td className="p-2">{app.email}</td>
                        <td className="p-2">{app.department}</td>
                        <td className="p-2">{app.position}</td>
                        <td className="p-2">{app.status}</td>

                        <td className="p-2 flex gap-2">
                            <button
                                onClick={() => openCv(app.id)}
                                className="bg-blue-600 px-2 py-1 rounded"
                            >
                                CV
                            </button>

                            <button
                                onClick={() => updateStatus(app.id, "ACCEPTED")}
                                className="bg-green-600 px-2 py-1 rounded"
                            >
                                Onayla
                            </button>

                            <button
                                onClick={() => updateStatus(app.id, "REJECTED")}
                                className="bg-red-600 px-2 py-1 rounded"
                            >
                                Reddet
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CvServicePage;