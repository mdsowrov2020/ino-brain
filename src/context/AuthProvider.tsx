"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import supabase from "@/lib/supabase";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isLoaded || !user) {
        console.log("Auth Provider: User not loaded or not authenticated");
        return;
      }

      setSyncStatus("syncing");
      console.log("Auth Provider: Starting user sync...");

      try {
        const { id, fullName, imageUrl, primaryEmailAddress } = user;

        // Validate email exists
        if (!primaryEmailAddress?.emailAddress) {
          console.error("Auth Provider: No email found for user");
          setSyncStatus("error");
          return;
        }

        const userData = {
          clerk_id: id,
          email: primaryEmailAddress.emailAddress,
          name: fullName || "",
          image_url: imageUrl || "",
        };

        console.log("Auth Provider: Syncing user data:", userData);

        // Insert or update user in Supabase
        const { data, error } = await supabase
          .from("users")
          .upsert(userData, {
            onConflict: "clerk_id",
          })
          .select();

        if (error) {
          console.error(
            "Auth Provider: Error syncing user to Supabase:",
            error
          );
          console.error("Auth Provider: Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          setSyncStatus("error");
        } else {
          console.log("Auth Provider: User synced successfully:", data);
          setSyncStatus("success");
        }
      } catch (err) {
        console.error("Auth Provider: Unexpected error during sync:", err);
        setSyncStatus("error");
      }
    };

    syncUserWithSupabase();
  }, [user, isLoaded]);

  // Debug: Log current auth state
  useEffect(() => {
    console.log("Auth Provider State:", {
      isLoaded,
      hasUser: !!user,
      userId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
      syncStatus,
    });
  }, [isLoaded, user, syncStatus]);

  return <>{children}</>;
};
