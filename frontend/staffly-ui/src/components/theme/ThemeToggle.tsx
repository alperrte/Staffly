import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="theme-icon-button"
            aria-label={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
            title={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
};

export default ThemeToggle;
