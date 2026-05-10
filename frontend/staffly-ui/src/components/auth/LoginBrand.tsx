import stafflyLogo from "../../assets/logo.png";

const LoginBrand = () => {
    return (
        <div className="mb-10 flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 p-[3px] shadow-[0_0_35px_rgba(59,130,246,0.75)]">
                <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                    <img
                        src={stafflyLogo}
                        alt="Staffly Logo"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            <div>
                <h1 className="leading-none text-[2.15rem] font-semibold tracking-[0.38em] text-white">
                    STAFFLY
                </h1>
                <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.44em] text-sky-300">
                    HR Management System
                </p>
            </div>
        </div>
    );
};

export default LoginBrand;