// utils/chatApi.js
export const sendMessageToDocument = async (documentId, userMessage) => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/chats/from-document",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          userMessage,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
};
