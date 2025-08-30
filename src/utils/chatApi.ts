// utils/chatApi.ts
export const sendMessageToDocument = async (
  documentId: string,
  userMessage: string,
  userId?: string | null
) => {
  try {
    console.log("🚀 Sending message to API:", {
      documentId,
      userMessage: userMessage.substring(0, 50) + "...",
      userId: userId || "null",
    });

    const response = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        userMessage,
        userId: userId || null,
      }),
    });

    console.log("📡 API Response status:", response.status);
    console.log(
      "📡 API Response headers:",
      response.headers.get("content-type")
    );

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Response is not JSON, likely an HTML error page
      const htmlResponse = await response.text();
      console.error(
        "❌ API returned HTML instead of JSON:",
        htmlResponse.substring(0, 200) + "..."
      );

      return {
        success: false,
        error: `Server error - API returned HTML instead of JSON. Status: ${response.status}`,
        status: response.status,
        details: htmlResponse.substring(0, 500), // First 500 chars for debugging
      };
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON response:", jsonError);
      const textResponse = await response.text();
      return {
        success: false,
        error: "Invalid JSON response from server",
        status: response.status,
        details: textResponse.substring(0, 500),
      };
    }

    if (!response.ok) {
      console.error("❌ API Error Response:", data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to send message`,
        status: response.status,
        details: data.details || data.message,
      };
    }

    console.log("✅ API Success Response:", data);
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error("❌ Network or other error in sendMessageToDocument:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown network error occurred",
      status: 0, // Network error
      details: "Check network connection and API server status",
    };
  }
};
