"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import supabase from "@/lib/supabase";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isLoaded || !user) return;

      const { id, fullName, imageUrl, primaryEmailAddress } = user;

      // Insert or update user in Supabase
      const { error } = await supabase.from("users").upsert({
        clerk_id: id,
        email: primaryEmailAddress?.emailAddress,
        name: fullName,
        image_url: imageUrl,
      });

      if (error) {
        console.error("Error syncing user to Supabase:", error);
      }
    };

    syncUserWithSupabase();
  }, [user, isLoaded]);

  return <>{children}</>;
};
