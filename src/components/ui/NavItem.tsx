"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItems {
  title: string;
  path: string;
}

const navItems: NavItems[] = [
  { title: "Dashboard", path: "/" },
  { title: "Upload Documents", path: "/upload" },
  { title: "AI Chat", path: "/chat" },
  { title: "Search", path: "/search" },
  { title: "Summaries", path: "/summaries" },
  { title: "Settings", path: "/settings" },
];

const NavItem = () => {
  const pathname = usePathname();
  return (
    <ul className="px-3">
      {navItems.map((item, index) => {
        return (
          <li
            key={index}
            className="[&:not(:last-child)]:mb-2"
            // className=" [&:not(:last-child)]:border-b [&:not(:last-child)]:border-b-blue-50 "
          >
            <Link
              href={item.path}
              className={` block w-full py-3 pl-3 rounded-sm hover:bg-gray-700/50 transition-all duration-75 ${
                pathname === item.path ? "bg-gray-700/50" : ""
              }`}
            >
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavItem;
