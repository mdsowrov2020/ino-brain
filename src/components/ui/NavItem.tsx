"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  LayoutDashboard,
  Upload,
  MessageCircle,
  Search,
  FileText,
  Settings,
} from "lucide-react";
import LogoutButton from "../AuthBtn";

interface NavItems {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItems[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Upload Documents",
    path: "/upload",
    icon: <Upload className="w-5 h-5" />,
  },
  {
    title: "AI Chat",
    path: "/chat",
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    title: "Search",
    path: "/search",
    icon: <Search className="w-5 h-5" />,
  },
  {
    title: "Summaries",
    path: "/summaries",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

interface NavItemProps {
  isOpen: boolean;
}

const NavItem = ({ isOpen }: NavItemProps) => {
  const pathname = usePathname();

  return (
    <div className={isOpen ? "px-3" : "px-2"}>
      <ul>
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;

          return (
            <li key={index} className="mb-2">
              {isOpen ? (
                <Link
                  href={item.path}
                  className={`flex items-center w-full py-3 pl-3 pr-4 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-r-2 border-blue-500"
                      : ""
                  }`}
                >
                  <span
                    className={`mr-3 transition-colors duration-200 ${
                      isActive
                        ? "text-blue-500"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              ) : (
                <div className="relative group">
                  <Link
                    href={item.path}
                    className={`flex items-center justify-center w-full py-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        : ""
                    }`}
                  >
                    <span
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "text-blue-500"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                      }`}
                    >
                      {item.icon}
                    </span>
                  </Link>

                  {/* Tooltip */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    {item.title}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className={`mt-6 ${isOpen ? "px-0" : "flex justify-center"}`}>
        <LogoutButton isCollapsed={!isOpen} />
      </div>
    </div>
  );
};

export default NavItem;
