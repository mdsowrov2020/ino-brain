"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MessageBox from "./MessageBox";
import WriteMessageBox from "./WriteMessageBox";
import { sendMessageToDocument } from "@/utils/chatApi";
import { DocumentData, getDocumentById } from "@/utils/documentApi";
import { useUser } from "@clerk/nextjs"; // If using Clerk auth

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  error?: boolean;
}

interface ChatHistoryEntry {
  id: number;
  documentId: string;
  userId: string | null;
  messages: { role: "user" | "assistant"; content: string }[];
  created_at: string;
}

const ChatContainer = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // To store chat messages
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const { user } = useUser(); // Get current user from Clerk

  // Load chat history when component mounts or documentId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!documentId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        setIsLoadingHistory(true);
        const response = await fetch(
          `/api/chats?documentId=${documentId}${
            user?.id ? `&userId=${user.id}` : ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const chatHistory: ChatHistoryEntry[] = await response.json();

          // Convert chat history to messages format
          const convertedMessages: ChatMessage[] = [];
          let messageId = 1;

          chatHistory.forEach((chat) => {
            chat.messages.forEach((msg) => {
              convertedMessages.push({
                id: messageId++,
                text: msg.content,
                sender: msg.role === "user" ? "user" : "bot",
                timestamp: chat.created_at,
              });
            });
          });

          setMessages(convertedMessages);
          console.log(
            `✅ Loaded ${convertedMessages.length} messages from chat history`
          );
        } else {
          console.warn("No chat history found or error loading history");
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [documentId, user?.id]);

  const handleSendMessage = async () => {
    if (!input.trim() || !documentId || isLoading) return;

    const userMessage = input.trim();
    setIsLoading(true);

    try {
      // Add user message to chat immediately
      const newUserMessage: ChatMessage = {
        id: Date.now(),
        text: userMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMessage]);

      // Clear input
      setInput("");

      // Send message to API with userId
      const result = await sendMessageToDocument(
        documentId,
        userMessage,
        user?.id || null // Pass user ID if available
      );

      console.log("API call result:", result);

      if (result.success) {
        // Add bot response to chat
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: result.data.reply || "Message sent successfully",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        console.log("API Response:", result.data);

        // Note: Chat history is automatically saved by the API
        if (result.data.chatSaved) {
          console.log("✅ Chat history saved to database");
        }
      } else {
        // Handle error with more detailed logging
        console.error("❌ API Error Details:", {
          error: result.error,
          status: result.status,
          details: result.details,
        });

        let errorText = "Sorry, there was an error sending your message.";

        // Provide more specific error messages based on status
        if (result.status === 0) {
          errorText =
            "Network error - please check your connection and try again.";
        } else if (result.status === 404) {
          errorText = "Chat API not found. Please contact support.";
        } else if (result.status === 500) {
          errorText = "Server error. Please try again in a moment.";
        } else if (result.error) {
          errorText = `Error: ${result.error}`;
        }

        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          text: errorText,
          sender: "bot",
          timestamp: new Date().toISOString(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "An unexpected error occurred. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Input:", input);
  console.log("Document ID:", documentId);
  console.log("Messages:", messages);

  const [documentName, setDocumentName] = useState("No document selected");

  useEffect(() => {
    if (!documentId) return;

    // Fetch document when id changes
    const fetchDoc = async () => {
      try {
        const doc: DocumentData = await getDocumentById(documentId);
        setDocumentName(doc.fileName);
      } catch (error) {
        console.error("Failed to fetch document:", error);
        setDocumentName("Error loading document");
      }
    };

    fetchDoc();
  }, [documentId]);

  return (
    <>
      <header className="bg-gray-500/30 px-3 py-5 rounded-tl-md rounded-tr-md">
        <h4>{documentName}</h4>
        {isLoadingHistory && (
          <p className="text-xs text-gray-400 mt-1">Loading chat history...</p>
        )}
      </header>
      <div className="rounded-md bg-gray-700/30 h-full w-full grid grid-rows-[1fr_80px]">
        <div className="h-full overflow-y-auto">
          <MessageBox
            documentId={documentId}
            messages={messages}
            isLoading={isLoading}
          />
        </div>
        <WriteMessageBox
          setInput={setInput}
          input={input}
          onSendMessage={handleSendMessage}
          disabled={isLoading || !documentId || isLoadingHistory}
          placeholder={
            isLoadingHistory
              ? "Loading chat history..."
              : !documentId
              ? "No document selected"
              : "Type your message..."
          }
        />
      </div>
    </>
  );
};

export default ChatContainer;
