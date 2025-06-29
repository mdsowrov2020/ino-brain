// hooks/useProcess.ts
import { useState, useCallback } from "react";

interface ProcessResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const useProcess = () => {
  const [isProcessed, setIsProcessed] = useState(false);

  const processFile = useCallback(
    async (documentId: string): Promise<ProcessResult> => {
      console.log("🚀 Starting processFile for documentId:", documentId);

      if (!documentId) {
        console.error("❌ Missing document ID");
        return { success: false, error: "Missing document ID" };
      }

      try {
        // Step 1: Call /api/documents/vectorize (which calls process internally)
        console.log("📡 Step 1: Calling vectorize API...");

        const response = await fetch("/api/documents/vectorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId }),
        });

        console.log(
          "📡 Vectorize response status:",
          response.status,
          response.statusText
        );
        console.log(
          "📡 Vectorize response headers:",
          Object.fromEntries(response.headers.entries())
        );

        const responseText = await response.text();
        console.log(
          "📡 Vectorize raw response:",
          responseText.substring(0, 500)
        );

        if (!responseText.trim()) {
          console.error("❌ Empty server response from vectorize");
          return { success: false, error: "Empty server response" };
        }

        // Parse response
        let parsed;
        try {
          parsed = JSON.parse(responseText);
          console.log("✅ Vectorize parsed response:", parsed);
        } catch (parseError) {
          console.error("❌ Failed to parse vectorize response:", parseError);
          return responseText.includes("<html")
            ? { success: false, error: "Server returned HTML instead of JSON" }
            : {
                success: false,
                error: `Invalid JSON: ${responseText.slice(0, 200)}...`,
              };
        }

        if (!response.ok) {
          console.error("❌ Vectorize API failed:", parsed?.error);
          return {
            success: false,
            error: parsed?.error || "Vectorization failed",
          };
        }

        // Step 2: If vectorize was successful, mark as processed in DB
        if (parsed?.success) {
          console.log("📡 Step 2: Updating process field in DB...");

          const updateRes = await fetch(
            `/api/documents/${documentId}/process`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ process: true }),
            }
          );

          console.log(
            "📡 Process update response status:",
            updateRes.status,
            updateRes.statusText
          );

          const updateResponseText = await updateRes.text();
          console.log("📡 Process update raw response:", updateResponseText);

          let updateJson;
          try {
            updateJson = JSON.parse(updateResponseText);
            console.log("✅ Process update parsed response:", updateJson);
          } catch (parseError) {
            console.error(
              "❌ Failed to parse process update response:",
              parseError
            );
            return {
              success: false,
              error: `Failed to parse update response: ${updateResponseText.slice(
                0,
                200
              )}`,
            };
          }

          if (!updateRes.ok || !updateJson.success) {
            console.error(
              "❌ Failed to update process field:",
              updateJson?.error
            );
            return {
              success: false,
              error: updateJson?.error || "Failed to update process field",
            };
          }

          console.log("✅ Successfully processed file!");
          setIsProcessed(true);
          return {
            success: true,
            data: {
              vectorizeMessage: parsed.message,
              storedChunks: parsed.storedChunks,
              updatedDocument: updateJson.data,
            },
          };
        }

        console.error("❌ Vectorization did not return success flag");
        return {
          success: false,
          error: "Vectorization completed but success flag not set",
        };
      } catch (err: any) {
        console.error("❌ Unexpected error in processFile:", err);
        console.error("❌ Error stack:", err.stack);
        return {
          success: false,
          error: err?.message || "Unexpected error",
        };
      }
    },
    []
  );

  return {
    isProcessed,
    setIsProcessed,
    processFile,
  };
};
