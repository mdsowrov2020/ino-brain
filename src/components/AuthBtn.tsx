"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, LogIn } from "lucide-react";

export default function AuthButton() {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <button className="bg-gray-300 text-gray-600 px-6 py-2.5 rounded-lg cursor-not-allowed animate-pulse">
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    // Logout Button
    return (
      <button
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
        onClick={() => signOut(() => (window.location.href = "/sign-in"))}
      >
        <LogOut size={18} />
        Logout
      </button>
    );
  }

  // Sign In Button
  return (
    <button
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
      onClick={() => (window.location.href = "/sign-in")}
    >
      <LogIn size={18} />
      Sign In
    </button>
  );
}
