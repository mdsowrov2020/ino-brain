import React from "react";
import DocumentList from "./DocumentList";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import supabase from "@/lib/supabase";

const Documents = async () => {
  // Get the authentication context on the server side
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Instead of making an API call, directly query the database
    // Get user's email from database
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("clerk_id", userId)
      .single();

    if (!userData?.email) {
      throw new Error("User profile not found");
    }

    // Fetch user's documents directly
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("email", userData.email)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform data to include formatted file size
    const { formatFileSize } = await import("@/utils/helper");
    const transformedData = documents.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.size),
    }));

    return (
      <div className=" border border-gray-800/60 rounded-md p-5 h-[94vh] grid grid-rows-1">
        <div className="overflow-y-auto">
          <DocumentList data={transformedData} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching documents:", error);

    return (
      <div className=" border border-gray-800/60 rounded-md p-5 h-[94vh] grid grid-rows-1">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Unable to load documents
            </h3>
            <p className="text-gray-500">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Documents;
