type Department = {
    id: number;
    name: string;
    description: string;
};
import { useState } from "react";
import { useEffect } from "react";
import { getDepartments } from "../../services/departmentService";

function DepartmentsPage() {

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showDepartments, setShowDepartments] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [updateName, setUpdateName] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [deletedDepartments, setDeletedDepartments] = useState<Department[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);


    const loadDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await loadDepartments();
        };

        fetchData().catch(console.error);
    }, []);

    const btnStyle = {
        background: "#020617",
        border: "1px solid #1e293b",
        padding: "12px",
        borderRadius: "10px",
        color: "white",
        textAlign: "left" as const,
        cursor: "pointer",
        transition: "0.2s",

    };

    const handleCreate = async () => {

        const token = localStorage.getItem("token");

        console.log("CREATE BAŞLADI");
        try {
            const response = await fetch("http://localhost:8083/departments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    name,
                    description
                })
            });


            console.log("STATUS:", response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error("HATA:", text);
                alert("Hata oluştu! Status: " + response.status);
                return;
            }

            const data = await response.json();
            console.log("BAŞARILI:", data);
            alert("Departman oluşturuldu!");

            setIsOpen(false);
            setName("");
            setDescription("");

        } catch (err) {
            console.error("NETWORK HATA:", err);
            alert("Sunucuya ulaşılamadı!");
        }
        await loadDepartments();
    };
    const handleUpdate = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:8083/departments/${selectedDepartmentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        name: updateName,
                        description: updateDescription
                    })
                }
            );

            if (!response.ok) {
                alert("Güncelleme başarısız");
                return;
            }

            alert("Güncellendi!");

            setIsUpdateOpen(false);
            await loadDepartments();

        } catch (err) {
            console.error(err);
            alert("Hata oluştu");
        }
    };
    const handleDelete = async () => {

        if (!selectedDepartmentId) {
            alert("Lütfen departman seç");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:8083/departments/${selectedDepartmentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (!response.ok) {
                alert("Silme başarısız");
                return;
            }

            alert("Silindi!");

            // 🔥 SİLİNENİ LİSTEYE EKLE
            const deleted = departments.find(d => d.id === selectedDepartmentId);
            if (deleted) {
                setDeletedDepartments(prev => [...prev, deleted]);
            }

            // 🔥 ANA LİSTEDEN ÇIKAR
            setDepartments(prev => prev.filter(d => d.id !== selectedDepartmentId));

        } catch (err) {
            console.error(err);
            alert("Hata oluştu");
        }
    };
    return (
        <div style={{
            padding: "40px",
            background: "#020617",
            minHeight: "100vh",
            color: "white",
            overflowY: "auto"
        }}>

            {/* 🔷 ÜST KART */}
            <div style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "20px",
                boxShadow: "0 0 20px rgba(0,0,0,0.4)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Departman Yönetimi</h2>

                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            background: "#38bdf8",
                            color: "white",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "none"
                        }}
                    >
                        + Departman Ekle
                    </button>
                </div>

            </div>

            {/* 🔷 ALT KART */}
            <div style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                padding: "20px",
                borderRadius: "16px",
                boxShadow: "0 0 20px rgba(0,0,0,0.4)"
            }}>

                {/* 🔽 DEPARTMANLAR */}
                <div
                    onClick={() => setShowDepartments(!showDepartments)}
                    style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        padding: "12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        marginBottom: "10px"
                    }}
                >
                    📂 Departmanlar
                </div>

                {/* AÇILAN LİSTE */}
                {showDepartments && (
                    <div style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: "10px",
                        padding: "10px",
                        marginBottom: "10px"
                    }}>
                        {departments.map((dep) => (
                            <div key={dep.id} style={{
                                padding: "8px",
                                borderBottom: "1px solid rgba(255,255,255,0.1)"
                            }}>
                                {dep.name} - {dep.description}
                            </div>
                        ))}
                    </div>
                )}
                <div
                    onClick={() => setShowDeleted(!showDeleted)}
                    style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        padding: "12px",
                        borderRadius: "10px",
                        marginTop: "10px",
                        cursor: "pointer"
                    }}
                >
                    🗑️ Silinen Departmanlar
                </div>

                {showDeleted && deletedDepartments.map((dep) => (
                    <div key={dep.id} style={{
                        padding: "8px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        color: "gray"
                    }}>
                        {dep.name} - {dep.description}
                    </div>
                ))}

                {/* 🔹 SABİT BAŞLIKLAR */}
                <div
                    style={btnStyle}
                    onClick={() => setIsUpdateOpen(true)}
                >
                    ✏️ Departman güncelle
                </div>
                <div
                    style={btnStyle}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    🗑️ Soft delete
                </div>
                {showDropdown && (
                    <div style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                        marginBottom: "10px"
                    }}>
                        {departments.map((dep) => (
                            <div
                                key={dep.id}
                                onClick={() => {
                                    const confirmDelete = window.confirm("Bu departmanı silmek istediğine emin misin?");

                                    if (!confirmDelete) return;

                                    setSelectedDepartmentId(dep.id);
                                    handleDelete();
                                    setShowDropdown(false);
                                }}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                    cursor: "pointer"
                                }}
                            >
                                {dep.name}
                            </div>
                        ))}
                    </div>
                )}

                <div style={btnStyle}>👑 Yönetici belirle</div>

            </div>

            {/* 🔥 MODAL AYNI KALDI */}
            {isOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>

                    <div style={{
                        background: "#0F1B3D",
                        padding: "30px",
                        borderRadius: "20px",
                        width: "400px",
                        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                    }}>

                        <h2 style={{ color: "white", marginBottom: "20px" }}>
                            Yeni Departman
                        </h2>

                        <input
                            placeholder="Departman Adı"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: "100%",
                                marginBottom: "10px",
                                padding: "10px",
                                borderRadius: "8px",
                                background: "#020617",
                                border: "1px solid #334155",
                                color: "white"
                            }}
                        />

                        <input
                            placeholder="Açıklama"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: "100%",
                                marginBottom: "20px",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#1B2A6B",
                                color: "white"
                            }}
                        />

                        <button
                            onClick={handleCreate}
                            style={{
                                background: "#1B2A6B",
                                color: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "100%",
                                marginBottom: "10px",
                                border: "none"
                            }}
                        >
                            Oluştur
                        </button>

                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "red",
                                color: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "100%",
                                border: "none"
                            }}
                        >
                            İptal
                        </button>

                    </div>
                </div>

            )}
            {isUpdateOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <div style={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        padding: "30px",
                        borderRadius: "20px",
                        width: "400px"
                    }}>
                        <h2 style={{ marginBottom: "20px" }}>
                            Departman Güncelle
                        </h2>
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                background: "#020617",
                                border: "1px solid #334155",
                                padding: "10px",
                                borderRadius: "8px",
                                marginBottom: "10px",
                                cursor: "pointer"
                            }}
                        >
                            {selectedDepartmentId
                                ? departments.find(d => d.id === selectedDepartmentId)?.name
                                : "Departman seç"}
                        </div>

                        {showDropdown && (
                            <div style={{
                                background: "#020617",
                                border: "1px solid #1e293b",
                                borderRadius: "8px",
                                marginBottom: "10px"
                            }}>
                                {departments.map((dep) => (
                                    <div
                                        key={dep.id}
                                        onClick={() => {
                                            setSelectedDepartmentId(dep.id);
                                            setUpdateName(dep.name);
                                            setUpdateDescription(dep.description);
                                            setShowDropdown(false);
                                        }}
                                        style={{
                                            padding: "10px",
                                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {dep.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        <input
                            placeholder="Yeni isim"
                            value={updateName}
                            onChange={(e) => setUpdateName(e.target.value)}
                            style={{
                                width: "100%",
                                marginBottom: "10px",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #334155",
                                background: "#020617",
                                color: "white"
                            }}
                        />

                        <input
                            placeholder="Yeni açıklama"
                            value={updateDescription}
                            onChange={(e) => setUpdateDescription(e.target.value)}
                            style={{
                                width: "100%",
                                marginBottom: "20px",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #334155",
                                background: "#020617",
                                color: "white"
                            }}
                        />

                        <button
                            onClick={handleUpdate}
                            style={{
                                background: "#38bdf8",
                                color: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "100%",
                                marginBottom: "10px",
                                border: "none"
                            }}
                        >
                            Güncelle
                        </button>

                        <button
                            onClick={() => setIsUpdateOpen(false)}
                            style={{
                                background: "red",
                                color: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "100%",
                                border: "none"
                            }}
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}
        </div>

    );

}

export default DepartmentsPage;