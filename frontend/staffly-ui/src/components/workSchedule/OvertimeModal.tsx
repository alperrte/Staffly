import { useMemo } from "react";
import DatePicker from "react-datepicker";
import { CalendarClock, FileText, User, X } from "lucide-react";
import { tr } from "date-fns/locale";

import "react-datepicker/dist/react-datepicker.css";

import type {
    DepartmentResponse,
    EmployeeResponse,
} from "../../types/workScheduleTypes";

type OvertimeFormState = {
    employeeId: string;
    departmentId: string;
    overtimeDate: string;
    startTime: string;
    endTime: string;
    reason: string;
};

type OvertimeModalProps = {
    selectedOvertimeId: number | null;
    overtimeForm: OvertimeFormState;
    setOvertimeForm: React.Dispatch<React.SetStateAction<OvertimeFormState>>;
    departments: DepartmentResponse[];
    employees: EmployeeResponse[];
    handleDepartmentSelectForOvertime: (departmentId: string) => void;
    handleEmployeeSelectForOvertime: (employeeId: string) => void;
    onClose: () => void;
    onSave: () => void;
};

const timeOptions = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00",
];

const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 [&>option]:bg-slate-950";

const OvertimeModal = ({
                           selectedOvertimeId,
                           overtimeForm,
                           setOvertimeForm,
                           departments,
                           employees,
                           handleDepartmentSelectForOvertime,
                           handleEmployeeSelectForOvertime,
                           onClose,
                           onSave,
                       }: OvertimeModalProps) => {
    const selectedDate = overtimeForm.overtimeDate
        ? new Date(`${overtimeForm.overtimeDate}T12:00:00`)
        : null;

    const filteredEmployees = useMemo(() => {
        if (!overtimeForm.departmentId) return [];

        return employees.filter(
            (employee) => employee.departmentId === Number(overtimeForm.departmentId)
        );
    }, [employees, overtimeForm.departmentId]);

    const endTimeOptions = timeOptions.filter(
        (time) => !overtimeForm.startTime || time > overtimeForm.startTime
    );

    const handleDateChange = (date: Date | null) => {
        if (!date) return;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        setOvertimeForm((prev) => ({
            ...prev,
            overtimeDate: `${year}-${month}-${day}`,
        }));
    };

    const handleStartTimeChange = (value: string) => {
        setOvertimeForm((prev) => ({
            ...prev,
            startTime: value,
            endTime: prev.endTime && prev.endTime <= value ? "" : prev.endTime,
        }));
    };

    const handleEndTimeChange = (value: string) => {
        setOvertimeForm((prev) => ({
            ...prev,
            endTime: value,
        }));
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-sky-400/25 bg-slate-950 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-white/10 px-7 py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                            <CalendarClock className="h-7 w-7" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-white">
                                {selectedOvertimeId ? "Ek Mesaiyi Düzenle" : "Çalışana Ek Mesai Ata"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Departman seçimine göre çalışanları listeleyip ek mesai tanımlayın.
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

                <div className="space-y-5 px-7 py-6">
                    <section className="rounded-3xl border border-sky-400/20 bg-slate-950/80 p-5">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                <User className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className="font-extrabold text-white">Çalışan Bilgisi</h3>
                                <p className="text-sm text-slate-500">
                                    Önce departmanı seçin, ardından o departmandaki çalışanı seçin.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-400">
                                    Departman
                                </span>

                                <select
                                    className={inputClass}
                                    value={overtimeForm.departmentId}
                                    onChange={(e) => handleDepartmentSelectForOvertime(e.target.value)}
                                >
                                    <option value="">Departman seçiniz</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-400">
                                    Çalışan
                                </span>

                                <select
                                    className={inputClass}
                                    value={overtimeForm.employeeId}
                                    disabled={!overtimeForm.departmentId}
                                    onChange={(e) => handleEmployeeSelectForOvertime(e.target.value)}
                                >
                                    <option value="">
                                        {overtimeForm.departmentId
                                            ? "Çalışan seçiniz"
                                            : "Önce departman seçiniz"}
                                    </option>

                                    {filteredEmployees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.firstName} {employee.lastName}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                <CalendarClock className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className="font-extrabold text-white">Mesai Zamanı</h3>
                                <p className="text-sm text-slate-500">
                                    Ek mesainin tarihini, başlangıç ve bitiş saatini belirleyin.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-400">
                                    Ek Mesai Tarihi
                                </span>

                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    locale={tr}
                                    dateFormat="dd.MM.yyyy"
                                    calendarStartDay={1}
                                    className={inputClass}
                                    wrapperClassName="w-full"
                                    popperClassName="z-[13000]"
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-400">
                                    Başlangıç Saati
                                </span>

                                <select
                                    className={inputClass}
                                    value={overtimeForm.startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                >
                                    <option value="">Saat seçiniz</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-400">
                                    Bitiş Saati
                                </span>

                                <select
                                    className={inputClass}
                                    value={overtimeForm.endTime}
                                    disabled={!overtimeForm.startTime}
                                    onChange={(e) => handleEndTimeChange(e.target.value)}
                                >
                                    <option value="">
                                        {overtimeForm.startTime
                                            ? "Saat seçiniz"
                                            : "Önce başlangıç seçiniz"}
                                    </option>

                                    {endTimeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                <FileText className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className="font-extrabold text-white">Açıklama</h3>
                                <p className="text-sm text-slate-500">
                                    Ek mesai nedeni opsiyoneldir.
                                </p>
                            </div>
                        </div>

                        <label>
                            <span className="mb-2 block text-xs font-bold text-slate-400">
                                Ek Mesai Nedeni
                            </span>

                            <textarea
                                className={`${inputClass} min-h-[120px] resize-none`}
                                value={overtimeForm.reason}
                                onChange={(e) =>
                                    setOvertimeForm((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                    }))
                                }
                                placeholder="Örn: Proje teslimi, operasyon yoğunluğu, kapanış raporu..."
                            />
                        </label>
                    </section>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 px-7 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-slate-900 px-10 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
                    >
                        Vazgeç
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        className="rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-10 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    >
                        {selectedOvertimeId ? "Ek Mesaiyi Güncelle" : "Ek Mesai Ata"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OvertimeModal;