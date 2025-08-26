"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import MessageBox from "./MessageBox";
import WriteMessageBox from "./WriteMessageBox";
import { sendMessageToDocument } from "@/utils/chatApi";

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

  return (
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
  );
};

export default ChatContainer;
