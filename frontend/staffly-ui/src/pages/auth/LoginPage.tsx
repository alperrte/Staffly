import loginBg from "../../assets/login-bg.jpg";
import LoginBrand from "../../components/auth/LoginBrand";
import LoginForm from "../../components/auth/LoginForm";
import ActiveJobPostingsPanel from "../../components/recruitment/ActiveJobPostingsPanel";
import {
    Headphones,
    ShieldCheck,
    Users,
    Clock3,
} from "lucide-react";

const LoginPage = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0">
                <img
                    src={loginBg}
                    alt="Staffly Login Background"
                    className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(14,165,233,0.34),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(37,99,235,0.22),transparent_40%)]" />

                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-slate-950/78 to-black/70" />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
                <LoginBrand />

                <div className="grid w-full max-w-[86rem] grid-cols-1 gap-7 lg:grid-cols-2">
                    <LoginForm />
                    <ActiveJobPostingsPanel />
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({
                         icon,
                         title,
                         description,
                     }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => {
    return (
        <div className="flex items-center gap-4 border-white/10 xl:border-r xl:last:border-r-0">
            <div className="text-blue-400">{icon}</div>

            <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{description}</p>
            </div>
        </div>
    );
};

export default LoginPage;