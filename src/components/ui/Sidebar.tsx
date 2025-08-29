import Logo from "./Logo";
import NavItem from "./NavItem";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <aside
      className={`h-screen hidden sm:block border-r border-r-gray-700/30 relative transition-all duration-300 ${
        isOpen ? "w-[250px] lg:w-[280px]" : "w-[70px]"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Logo Section */}
      <div
        className={`text-center py-3 border-b border-b-gray-700/30 ${
          !isOpen && "px-2"
        }`}
      >
        {isOpen ? (
          <Logo />
        ) : (
          <div className="w-8 h-8 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-5">
        <NavItem isOpen={isOpen} />
      </div>
    </aside>
  );
};

export default Sidebar;
