import { useEffect, useState } from "react";
import {
    createDepartment,
    deleteDepartment,
    getDepartments,
    updateDepartment,
    type Department,
    type SubDepartment,
    type DepartmentPosition
} from "../../services/departmentService";

function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [expandedDepartmentIds, setExpandedDepartmentIds] = useState<number[]>([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

    const emptyPosition: DepartmentPosition = {
        name: "",
        description: ""
    };

    const emptySubDepartment: SubDepartment = {
        name: "",
        description: "",
        managerId: null,
        positions: [{ ...emptyPosition }]
    };

    const emptyDepartmentForm: Department = {
        name: "",
        description: "",
        managerId: null,
        subDepartments: [{ ...emptySubDepartment }]
    };

    const [createForm, setCreateForm] = useState<Department>(emptyDepartmentForm);
    const [updateForm, setUpdateForm] = useState<Department>(emptyDepartmentForm);

    const loadDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
            alert("Departmanlar alınamadı");
        }
    };

    useEffect(() => {
        loadDepartments().catch(console.error);
    }, []);

    const toggleDepartmentExpand = (id: number) => {
        setExpandedDepartmentIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const resetCreateForm = () => {
        setCreateForm({
            name: "",
            description: "",
            managerId: null,
            subDepartments: [
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }]
                }
            ]
        });
    };

    const mapDepartmentToForm = (dep: Department): Department => ({
        id: dep.id,
        name: dep.name,
        description: dep.description,
        managerId: dep.managerId ?? null,
        subDepartments:
            dep.subDepartments?.length > 0
                ? dep.subDepartments.map((sub) => ({
                    name: sub.name,
                    description: sub.description,
                    managerId: sub.managerId ?? null,
                    positions:
                        sub.positions?.length > 0
                            ? sub.positions.map((pos) => ({
                                name: pos.name,
                                description: pos.description
                            }))
                            : [{ name: "", description: "" }]
                }))
                : [
                    {
                        name: "",
                        description: "",
                        managerId: null,
                        positions: [{ name: "", description: "" }]
                    }
                ]
    });

    const handleCreateChange = (field: keyof Department, value: string | number | null) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateChange = (field: keyof Department, value: string | number | null) => {
        setUpdateForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateSubDepartmentChange = (
        subIndex: number,
        field: keyof SubDepartment,
        value: string | number | null
    ) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                [field]: value
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleUpdateSubDepartmentChange = (
        subIndex: number,
        field: keyof SubDepartment,
        value: string | number | null
    ) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                [field]: value
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleCreatePositionChange = (
        subIndex: number,
        posIndex: number,
        field: keyof DepartmentPosition,
        value: string
    ) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            const updatedPositions = [...updatedSubs[subIndex].positions];
            updatedPositions[posIndex] = {
                ...updatedPositions[posIndex],
                [field]: value
            };
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedPositions
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleUpdatePositionChange = (
        subIndex: number,
        posIndex: number,
        field: keyof DepartmentPosition,
        value: string
    ) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            const updatedPositions = [...updatedSubs[subIndex].positions];
            updatedPositions[posIndex] = {
                ...updatedPositions[posIndex],
                [field]: value
            };
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedPositions
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const addCreateSubDepartment = () => {
        setCreateForm((prev) => ({
            ...prev,
            subDepartments: [
                ...prev.subDepartments,
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }]
                }
            ]
        }));
    };

    const addUpdateSubDepartment = () => {
        setUpdateForm((prev) => ({
            ...prev,
            subDepartments: [
                ...prev.subDepartments,
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }]
                }
            ]
        }));
    };

    const addCreatePosition = (subIndex: number) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: [
                    ...updatedSubs[subIndex].positions,
                    { name: "", description: "" }
                ]
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const addUpdatePosition = (subIndex: number) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: [
                    ...updatedSubs[subIndex].positions,
                    { name: "", description: "" }
                ]
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const removeCreateSubDepartment = (subIndex: number) => {
        setCreateForm((prev) => ({
            ...prev,
            subDepartments: prev.subDepartments.filter((_, i) => i !== subIndex)
        }));
    };

    const removeUpdateSubDepartment = (subIndex: number) => {
        setUpdateForm((prev) => ({
            ...prev,
            subDepartments: prev.subDepartments.filter((_, i) => i !== subIndex)
        }));
    };

    const removeCreatePosition = (subIndex: number, posIndex: number) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedSubs[subIndex].positions.filter((_, i) => i !== posIndex)
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const removeUpdatePosition = (subIndex: number, posIndex: number) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedSubs[subIndex].positions.filter((_, i) => i !== posIndex)
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const sanitizeDepartmentPayload = (data: Department): Department => {
        return {
            ...data,
            name: data.name.trim(),
            description: data.description.trim(),
            subDepartments: data.subDepartments
                .filter((sub) => sub.name.trim() !== "")
                .map((sub) => ({
                    ...sub,
                    name: sub.name.trim(),
                    description: sub.description.trim(),
                    positions: sub.positions
                        .filter((pos) => pos.name.trim() !== "")
                        .map((pos) => ({
                            name: pos.name.trim(),
                            description: pos.description.trim()
                        }))
                }))
        };
    };

    const handleCreate = async () => {
        try {
            const payload = sanitizeDepartmentPayload(createForm);
            await createDepartment(payload);
            alert("Departman oluşturuldu");
            setIsCreateOpen(false);
            resetCreateForm();
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("Departman oluşturulamadı");
        }
    };

    const handleOpenUpdate = (dep: Department) => {
        setSelectedDepartmentId(dep.id!);
        setUpdateForm(mapDepartmentToForm(dep));
        setIsUpdateOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedDepartmentId) {
            alert("Lütfen düzenlenecek departmanı seç");
            return;
        }

        try {
            const payload = sanitizeDepartmentPayload(updateForm);
            await updateDepartment(selectedDepartmentId, payload);
            alert("Departman güncellendi");
            setIsUpdateOpen(false);
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("Departman güncellenemedi");
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Departmanı silmek istediğine emin misin?");
        if (!confirmDelete) return;

        try {
            await deleteDepartment(id);
            alert("Departman silindi");
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("Departman silinemedi");
        }
    };

    return (
        <div
            style={{
                padding: "40px",
                background: "#020617",
                minHeight: "100vh",
                color: "white",
                overflowY: "auto"
            }}
        >
            <div
                style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    padding: "25px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0 }}>Departman Yönetimi</h2>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        style={primaryTopButtonStyle}
                    >
                        + Departman Ekle
                    </button>
                </div>
            </div>

            <div
                style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    padding: "20px",
                    borderRadius: "16px",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)"
                }}
            >
                <div
                    style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        padding: "12px",
                        borderRadius: "10px",
                        marginBottom: "12px"
                    }}
                >
                    📂 Departmanlar
                </div>

                <div
                    style={{
                        background: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: "10px",
                        padding: "10px"
                    }}
                >
                    {departments.map((dep) => {
                        const isExpanded = expandedDepartmentIds.includes(dep.id!);

                        return (
                            <div
                                key={dep.id}
                                style={{
                                    padding: "12px",
                                    borderBottom: "1px solid rgba(255,255,255,0.08)"
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "15px"
                                    }}
                                >
                                    <div
                                        onClick={() => toggleDepartmentExpand(dep.id!)}
                                        style={{
                                            flex: 1,
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{ fontWeight: 700 }}>
                                            {isExpanded ? "▼" : "▶"} {dep.name}
                                        </div>
                                        <div style={{ opacity: 0.85, marginTop: "3px" }}>
                                            {dep.description}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => handleOpenUpdate(dep)}
                                            style={editButtonStyle}
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            onClick={() => handleDelete(dep.id!)}
                                            style={dangerButtonStyle}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div
                                        style={{
                                            marginTop: "14px",
                                            marginLeft: "18px",
                                            paddingLeft: "14px",
                                            borderLeft: "2px solid #1e40af"
                                        }}
                                    >
                                        {dep.subDepartments && dep.subDepartments.length > 0 ? (
                                            dep.subDepartments.map((sub, subIndex) => (
                                                <div
                                                    key={subIndex}
                                                    style={{
                                                        marginBottom: "14px",
                                                        background: "#081226",
                                                        border: "1px solid #1e293b",
                                                        borderRadius: "10px",
                                                        padding: "12px"
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, color: "#93c5fd" }}>
                                                        ↳ {sub.name}
                                                    </div>
                                                    <div style={{ marginTop: "4px", opacity: 0.9 }}>
                                                        {sub.description}
                                                    </div>

                                                    {sub.positions && sub.positions.length > 0 && (
                                                        <div style={{ marginTop: "10px", paddingLeft: "14px" }}>
                                                            {sub.positions.map((pos, posIndex) => (
                                                                <div
                                                                    key={posIndex}
                                                                    style={{
                                                                        padding: "6px 0",
                                                                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                                                                    }}
                                                                >
                                                                    • <strong>{pos.name}</strong> — {pos.description}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ opacity: 0.7 }}>Alt departman bulunmuyor</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCreateOpen && (
                <ModalWrapper title="Yeni Departman">
                    <input
                        placeholder="Departman Adı"
                        value={createForm.name}
                        onChange={(e) => handleCreateChange("name", e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Departman Açıklama"
                        value={createForm.description}
                        onChange={(e) => handleCreateChange("description", e.target.value)}
                        style={inputStyle}
                    />

                    {createForm.subDepartments.map((sub, subIndex) => (
                        <div key={subIndex} style={subCardStyle}>
                            <input
                                placeholder="Alt Departman Adı"
                                value={sub.name}
                                onChange={(e) =>
                                    handleCreateSubDepartmentChange(subIndex, "name", e.target.value)
                                }
                                style={inputStyle}
                            />

                            <input
                                placeholder="Alt Departman Açıklama"
                                value={sub.description}
                                onChange={(e) =>
                                    handleCreateSubDepartmentChange(subIndex, "description", e.target.value)
                                }
                                style={inputStyle}
                            />

                            {sub.positions.map((pos, posIndex) => (
                                <div key={posIndex} style={{ marginLeft: "15px", marginBottom: "10px" }}>
                                    <input
                                        placeholder="Pozisyon Adı"
                                        value={pos.name}
                                        onChange={(e) =>
                                            handleCreatePositionChange(subIndex, posIndex, "name", e.target.value)
                                        }
                                        style={inputStyle}
                                    />

                                    <input
                                        placeholder="Pozisyon Açıklama"
                                        value={pos.description}
                                        onChange={(e) =>
                                            handleCreatePositionChange(subIndex, posIndex, "description", e.target.value)
                                        }
                                        style={inputStyle}
                                    />

                                    <button
                                        onClick={() => removeCreatePosition(subIndex, posIndex)}
                                        style={dangerButtonStyle}
                                    >
                                        Pozisyon Sil
                                    </button>
                                </div>
                            ))}

                            <button onClick={() => addCreatePosition(subIndex)} style={secondaryButtonStyle}>
                                + Pozisyon Ekle
                            </button>

                            <button
                                onClick={() => removeCreateSubDepartment(subIndex)}
                                style={{ ...dangerButtonStyle, marginLeft: "10px" }}
                            >
                                Alt Departman Sil
                            </button>
                        </div>
                    ))}

                    <button onClick={addCreateSubDepartment} style={secondaryButtonStyle}>
                        + Alt Departman Ekle
                    </button>

                    <button onClick={handleCreate} style={primaryButtonStyle}>
                        Oluştur
                    </button>

                    <button onClick={() => setIsCreateOpen(false)} style={dangerFullButtonStyle}>
                        İptal
                    </button>
                </ModalWrapper>
            )}

            {isUpdateOpen && (
                <ModalWrapper title="Departman Düzenle">
                    <input
                        placeholder="Departman Adı"
                        value={updateForm.name}
                        onChange={(e) => handleUpdateChange("name", e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Departman Açıklama"
                        value={updateForm.description}
                        onChange={(e) => handleUpdateChange("description", e.target.value)}
                        style={inputStyle}
                    />

                    {updateForm.subDepartments.map((sub, subIndex) => (
                        <div key={subIndex} style={subCardStyle}>
                            <input
                                placeholder="Alt Departman Adı"
                                value={sub.name}
                                onChange={(e) =>
                                    handleUpdateSubDepartmentChange(subIndex, "name", e.target.value)
                                }
                                style={inputStyle}
                            />

                            <input
                                placeholder="Alt Departman Açıklama"
                                value={sub.description}
                                onChange={(e) =>
                                    handleUpdateSubDepartmentChange(subIndex, "description", e.target.value)
                                }
                                style={inputStyle}
                            />

                            {sub.positions.map((pos, posIndex) => (
                                <div key={posIndex} style={{ marginLeft: "15px", marginBottom: "10px" }}>
                                    <input
                                        placeholder="Pozisyon Adı"
                                        value={pos.name}
                                        onChange={(e) =>
                                            handleUpdatePositionChange(subIndex, posIndex, "name", e.target.value)
                                        }
                                        style={inputStyle}
                                    />

                                    <input
                                        placeholder="Pozisyon Açıklama"
                                        value={pos.description}
                                        onChange={(e) =>
                                            handleUpdatePositionChange(subIndex, posIndex, "description", e.target.value)
                                        }
                                        style={inputStyle}
                                    />

                                    <button
                                        onClick={() => removeUpdatePosition(subIndex, posIndex)}
                                        style={dangerButtonStyle}
                                    >
                                        Pozisyon Sil
                                    </button>
                                </div>
                            ))}

                            <button onClick={() => addUpdatePosition(subIndex)} style={secondaryButtonStyle}>
                                + Pozisyon Ekle
                            </button>

                            <button
                                onClick={() => removeUpdateSubDepartment(subIndex)}
                                style={{ ...dangerButtonStyle, marginLeft: "10px" }}
                            >
                                Alt Departman Sil
                            </button>
                        </div>
                    ))}

                    <button onClick={addUpdateSubDepartment} style={secondaryButtonStyle}>
                        + Alt Departman Ekle
                    </button>

                    <button onClick={handleUpdate} style={primaryButtonStyle}>
                        Güncelle
                    </button>

                    <button onClick={() => setIsUpdateOpen(false)} style={dangerFullButtonStyle}>
                        İptal
                    </button>
                </ModalWrapper>
            )}
        </div>
    );
}

function ModalWrapper({
                          title,
                          children
                      }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >
            <div
                style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    padding: "30px",
                    borderRadius: "20px",
                    width: "720px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                }}
            >
                <h2 style={{ marginBottom: "20px" }}>{title}</h2>
                {children}
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white"
};

const subCardStyle = {
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
    background: "#081226"
};

const primaryTopButtonStyle = {
    background: "#38bdf8",
    color: "white",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
};

const primaryButtonStyle = {
    background: "#38bdf8",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    width: "100%",
    marginTop: "15px",
    marginBottom: "10px",
    border: "none",
    cursor: "pointer"
};

const secondaryButtonStyle = {
    background: "#1d4ed8",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px"
};

const editButtonStyle = {
    background: "#2563eb",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
};

const dangerButtonStyle = {
    background: "#991b1b",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
};

const dangerFullButtonStyle = {
    background: "#dc2626",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    width: "100%",
    border: "none",
    cursor: "pointer"
};

export default DepartmentsPage;