import React, { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Message from "./Message";

interface MessageBoxProps {
  documentId: string | null;
  messages: Array<{
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: string;
    error?: boolean;
  }>;
  isLoading: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  documentId,
  messages = [],
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user's display name
  const getUserDisplayName = () => {
    if (!isLoaded || !user) {
      return "there";
    }

    // Priority order: firstName, username, email name part, fallback
    return (
      user.firstName ||
      user.username ||
      user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "there"
    );
  };

  const displayName = getUserDisplayName();

  return (
    <div className="h-auto w-full flex flex-col gap-3 p-5">
      {/* Welcome messages - only show if no real messages yet */}
      {messages.length === 0 && (
        <>
          <Message message="Hello!" className="self-end" sender="user" />
          <Message
            message={`Hey ${displayName}! How can I help you?`}
            className="self-start"
            sender="bot"
          />
        </>
      )}

      {/* Render actual messages */}
      {messages.map((msg) => (
        <Message
          key={msg.id}
          message={msg.text}
          className={msg.sender === "user" ? "self-end" : "self-start"}
          sender={msg.sender}
          isError={msg.error}
          timestamp={msg.timestamp}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="self-start">
          <div className="inline-block p-3 rounded-2xl bg-gray-700/70 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
              </div>
              <span className="text-sm text-gray-300">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no document is selected */}
      {!documentId && messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">No document selected</p>
            <p className="text-sm">
              Please select a document to start chatting
            </p>
          </div>
        </div>
      )}

      {/* Loading state for user data */}
      {!isLoaded && messages.length === 0 && documentId && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="flex gap-1 justify-center mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            </div>
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageBox;
