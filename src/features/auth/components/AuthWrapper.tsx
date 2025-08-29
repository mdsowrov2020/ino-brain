"use client";
import { ReactNode, useEffect, useState } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import LayoutMain from "@/components/sections/layout/LayoutMain";
import supabase from "@/lib/supabase";

type AuthWrapperProps = {
  children: ReactNode;
};

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  // Sync user with Supabase
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isLoaded || !user) return;

      setSyncStatus("syncing");

      try {
        const { id, fullName, imageUrl, primaryEmailAddress } = user;

        if (!primaryEmailAddress?.emailAddress) {
          setSyncStatus("error");
          return;
        }

        const userData = {
          clerk_id: id,
          email: primaryEmailAddress.emailAddress,
          name: fullName || "",
          image_url: imageUrl || "",
        };

        const { error } = await supabase
          .from("users")
          .upsert(userData, { onConflict: "clerk_id" })
          .select();

        if (error) {
          console.error("Sync error:", error);
          setSyncStatus("error");
        } else {
          setSyncStatus("success");
        }
      } catch (err) {
        console.error("Unexpected sync error:", err);
        setSyncStatus("error");
      }
    };

    syncUserWithSupabase();
  }, [user, isLoaded]);

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes that don't need authentication
  const publicRoutes = ["/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show sign-in for unauthenticated users on protected routes
  if (!user && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
            },
          }}
        />
      </div>
    );
  }

  // Show sync loading for authenticated users
  if (user && syncStatus === "syncing") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // For authenticated users on protected routes, wrap with LayoutMain
  if (user && !isPublicRoute) {
    return <LayoutMain>{children}</LayoutMain>;
  }

  // For public routes or unauthenticated users, render children directly
  return <>{children}</>;
};
