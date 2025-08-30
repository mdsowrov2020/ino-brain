"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, LogIn } from "lucide-react";

interface AuthButtonProps {
  isCollapsed?: boolean;
}

export default function AuthButton({ isCollapsed = false }: AuthButtonProps) {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking auth
  if (!isLoaded) {
    if (isCollapsed) {
      return (
        <div className="relative group">
          <button className="w-full flex items-center justify-center py-3 rounded-lg bg-gray-300 cursor-not-allowed animate-pulse">
            <div className="w-5 h-5 bg-gray-400 rounded animate-pulse"></div>
          </button>
          {/* Tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Loading...
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
          </div>
        </div>
      );
    }

    return (
      <button className="w-full bg-gray-300 text-gray-600 px-4 py-2.5 rounded-lg cursor-not-allowed animate-pulse">
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    // Logout Button
    if (isCollapsed) {
      return (
        <div className="relative group">
          <button
            className="w-full flex items-center justify-center py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
          >
            <LogOut size={18} />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Logout
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
          </div>
        </div>
      );
    }

    return (
      <button
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium justify-center"
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    );
  }

  // Sign In Button
  if (isCollapsed) {
    return (
      <div className="relative group">
        <button
          className="w-full flex items-center justify-center py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          onClick={() => (window.location.href = "/sign-in")}
        >
          <LogIn size={18} />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
          Sign In
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium justify-center"
      onClick={() => (window.location.href = "/sign-in")}
    >
      <LogIn size={18} />
      <span>Sign In</span>
    </button>
  );
}
