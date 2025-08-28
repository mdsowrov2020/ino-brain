"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MessageBox from "./MessageBox";
import WriteMessageBox from "./WriteMessageBox";
import { sendMessageToDocument } from "@/utils/chatApi";
import { DocumentData, getDocumentById } from "@/utils/documentApi";

const ChatContainer = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]); // To store chat messages
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const handleSendMessage = async () => {
    if (!input.trim() || !documentId || isLoading) return;

    const userMessage = input.trim();
    setIsLoading(true);

    try {
      // Add user message to chat immediately
      const newUserMessage = {
        id: Date.now(),
        text: userMessage,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newUserMessage]);

      // Clear input
      setInput("");

      // Send message to API
      const result = await sendMessageToDocument(documentId, userMessage);
      console.log("API call result:", result);

      if (result.success) {
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: result.data.reply || "Message sent successfully",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);

        console.log("API Response:", result.data);
      } else {
        // Handle error
        console.error("Failed to send message:", result.error);
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, there was an error sending your message. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage = {
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
      <header className="bg-gray-500/30  px-3 py-5 rounded-tl-md rounded-tr-md">
        <h4>{documentName}</h4>
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
          disabled={isLoading || !documentId}
          placeholder={
            !documentId ? "No document selected" : "Type your message..."
          }
        />
      </div>
    </>
  );
};

export default ChatContainer;
