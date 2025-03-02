import { useThemeStore } from "./useThemeStore";
import { motion } from "framer-motion";

const ThemeSwitcher = () => {
    const { theme, setTheme } = useThemeStore();
    const themes = ["dark", "nord", "github"] as const;

    return (
        <div className="flex gap-2 p-4">
        {themes.map((t) => (
            <motion.button
            key={t}
            onClick={() => setTheme(t)}
            className="px-4 py-2 rounded-md border"
            style={{
                background: `var(--bg-secondary)`, // Update to use secondary background for buttons
                color: `var(--text-color)`,
                borderColor: theme === t ? "var(--primary-color)" : "var(--border-color)", // Use border color
                boxShadow: `0 4px 6px var(--shadow-color)`, // Add shadow to create depth
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            >
            {t}
            </motion.button>
        ))}
        </div>
    );
};

export default ThemeSwitcher;
