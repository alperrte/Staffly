import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import {
    getMyProfile,
    updateMyProfile,
    uploadProfileImage
} from "../../services/employeeService";

type Profile = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentName: string;
    positionName: string;
    hireDate: string;
    status: string;
};

const ProfilePage = () => {

    const [profile, setProfile] = useState<Profile | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
    });
    const [previewImage, setPreviewImage] = useState<string | null>(
        null
    );
    const handleSave = async () => {

        try {

            const updatedProfile = await updateMyProfile(formData);

            setProfile(updatedProfile);

            setIsEditing(false);

        } catch (error) {
            console.error(error);
        }
    };
    const handleImageChange = async (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        try {

            const updatedProfile =
                await uploadProfileImage(file);

            setProfile(updatedProfile);

            const imageUrl = URL.createObjectURL(file);

            setPreviewImage(imageUrl);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {

        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);

                if (data.profileImage) {
                    setPreviewImage(
                        "http://localhost:8082/" +
                        data.profileImage.replace(/\\/g, "/")
                    );
                }

                setFormData({
                    email: data.email || "",
                    phone: data.phone || "",
                });
            } catch (error) {
                console.error(error);
            }
        };

        fetchProfile();

    }, []);

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <h1 className="text-3xl font-bold text-white">
                    Profil
                </h1>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="
                rounded-xl
                bg-sky-500 px-4 py-2
                text-sm font-medium text-white
                hover:bg-sky-400
                transition
            "
                    >
                        Profili Düzenle
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="
                rounded-xl
                bg-green-500 px-4 py-2
                text-sm font-medium text-white
                hover:bg-green-400
                transition
            "
                    >
                        Kaydet
                    </button>
                )}

            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <div className="mb-8 flex flex-col items-center">

                    <div
                        className="
            flex h-32 w-32 items-center justify-center
            overflow-hidden rounded-full
            border-4 border-sky-500/40
            bg-slate-800
            text-4xl font-bold text-white
            shadow-[0_0_30px_rgba(56,189,248,0.35)]
        "
                    >

                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <>
                                {profile.firstName?.charAt(0)}
                                {profile.lastName?.charAt(0)}
                            </>
                        )}

                    </div>

                    {!previewImage ? (

                        <label
                            className="
            mt-4 cursor-pointer rounded-xl
            bg-sky-500 px-4 py-2
            text-sm font-medium text-white
            hover:bg-sky-400
            transition
        "
                        >
                            Fotoğraf Yükle

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                    ) : (

                        <div className="mt-4 flex gap-3">

                            <label
                                className="
                cursor-pointer rounded-xl
                bg-sky-500 px-4 py-2
                text-sm font-medium text-white
                hover:bg-sky-400
                transition
            "
                            >
                                Fotoğrafı Düzenle

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={() => setPreviewImage(null)}
                                className="
                rounded-xl
                bg-red-500 px-4 py-2
                text-sm font-medium text-white
                hover:bg-red-400
                transition
            "
                            >
                                Sil
                            </button>

                        </div>

                    )}

                </div>
                <div className="grid grid-cols-2 gap-6">

                    <div>
                        <p className="text-sm text-slate-400">Ad</p>
                        <p className="text-white font-medium">
                            {profile.firstName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Soyad</p>
                        <p className="text-white font-medium">
                            {profile.lastName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Email</p>

                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="
                mt-1 w-full rounded-xl
                border border-white/10
                bg-slate-800 px-3 py-2
                text-white
                outline-none
                focus:border-sky-400
            "
                            />
                        ) : (
                            <p className="text-white font-medium">
                                {profile.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Telefon</p>

                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                className="
                mt-1 w-full rounded-xl
                border border-white/10
                bg-slate-800 px-3 py-2
                text-white
                outline-none
                focus:border-sky-400
            "
                            />
                        ) : (
                            <p className="text-white font-medium">
                                {profile.phone}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Departman</p>
                        <p className="text-white font-medium">
                            {profile.departmentName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">Pozisyon</p>
                        <p className="text-white font-medium">
                            {profile.positionName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-400">İşe Giriş Tarihi</p>
                        <p className="text-white font-medium">
                            {profile.hireDate}
                        </p>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default ProfilePage;