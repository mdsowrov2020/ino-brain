// lib/saveChatHistory.ts
import supabase from "./supabase";

export async function saveChatHistory(
  documentId: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userId?: string | null
) {
  try {
    console.log("🔄 Starting saveChatHistory with params:", {
      documentId,
      messagesCount: messages.length,
      userId: userId || "null",
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
      })),
    });

    // Validate inputs
    if (!documentId) {
      throw new Error("documentId is required");
    }
    if (!messages || messages.length === 0) {
      throw new Error("messages array is required and cannot be empty");
    }

    // Test Supabase connection first
    console.log("🔗 Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("chats")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError);
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    console.log("✅ Supabase connection successful");

    // Check if documentId exists in documents table
    console.log("🔍 Checking if documentId exists in documents table...");
    const { data: docCheck, error: docError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .single();

    if (docError) {
      console.warn("⚠️  Document check failed:", docError);
      // Continue anyway, as the foreign key constraint will catch this
    } else if (docCheck) {
      console.log("✅ Document exists in documents table");
    }

    // Prepare the insert data
    const insertData = {
      documentId: documentId,
      messages: messages,
      userId: userId || null,
      created_at: new Date().toISOString(),
    };

    console.log("📝 Preparing to insert data:", {
      ...insertData,
      messages: `${messages.length} messages`,
    });

    // Insert the chat history (note: insert expects an array)
    const { data, error } = await supabase
      .from("chats")
      .insert([insertData]) // Wrap in array as required by Supabase
      .select(); // Return the inserted record for verification

    if (error) {
      console.error("❌ Supabase insert error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Provide more specific error messages
      if (error.code === "23503") {
        throw new Error(
          `Foreign key constraint failed: documentId '${documentId}' not found in documents table`
        );
      } else if (error.code === "23502") {
        throw new Error(`Required field is missing: ${error.message}`);
      } else {
        throw new Error(`Failed to save chat history: ${error.message}`);
      }
    }

    if (!data || data.length === 0) {
      console.warn("⚠️  Insert succeeded but no data returned");
      throw new Error("Insert succeeded but no data was returned");
    }

    console.log("🎉 Chat history saved successfully:", {
      id: data[0].id,
      documentId: data[0].documentId,
      userId: data[0].userId,
      messagesCount: data[0].messages?.length,
      created_at: data[0].created_at,
    });

    return data[0]; // Return the inserted chat record
  } catch (error) {
    console.error("💥 Error in saveChatHistory:", error);

    // Log additional debugging info
    console.error("🔍 Debug info:", {
      documentId,
      userId,
      messagesValid: Array.isArray(messages),
      messagesLength: messages?.length,
      firstMessage: messages?.[0],
    });

    throw error; // Re-throw to be handled by the calling function
  }
}

// Enhanced function to retrieve chat history with debugging
export async function getChatHistory(
  documentId: string,
  userId?: string | null
) {
  try {
    console.log("📚 Getting chat history for:", {
      documentId,
      userId: userId || "null",
    });

    let query = supabase
      .from("chats")
      .select("*")
      .eq("documentId", documentId)
      .order("created_at", { ascending: true });

    // If userId is provided, filter by user as well
    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error retrieving chat history:", error);
      throw new Error(`Failed to retrieve chat history: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} chat history entries`);
    return data || [];
  } catch (error) {
    console.error("💥 Error in getChatHistory:", error);
    throw error;
  }
}

// Function to test the chats table structure
export async function testChatsTable() {
  try {
    console.log("🔍 Testing chats table structure...");

    const { data, error } = await supabase.from("chats").select("*").limit(1);

    if (error) {
      console.error("❌ Chats table test failed:", error);
      return false;
    }

    console.log("✅ Chats table is accessible");
    console.log("📊 Sample structure:", data?.[0] || "No existing records");
    return true;
  } catch (error) {
    console.error("💥 Error testing chats table:", error);
    return false;
  }
}
