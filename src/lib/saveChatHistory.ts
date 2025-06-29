import supabase from "./supabase";

export async function saveChatHistory(
  documentId: string,
  messages: { role: "user" | "assistant"; content: string }[],
  userId?: string | null
) {
  const { error } = await supabase.from("chats").insert({
    documentId: documentId,
    messages,
    userId: userId ?? null,
  });

  if (error) throw new Error(error.message);
}
