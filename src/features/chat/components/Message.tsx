import React from "react";

type MessageProps = {
  message: string;
  className?: string;
  sender?: "user" | "bot";
  isError?: boolean;
  timestamp?: string;
};

const Message = ({
  message,
  className = "",
  sender = "bot",
  isError = false,
  timestamp,
}: MessageProps) => {
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStyles = () => {
    if (isError) {
      return "bg-red-500/20 text-red-200 border border-red-500/30";
    }
    if (sender === "user") {
      return "bg-blue-600/80 text-white";
    }
    return "bg-gray-700/70 text-gray-300";
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p
        className={`inline-block p-4 rounded-2xl max-w-[70%] break-words ${getMessageStyles()}`}
      >
        {message}
      </p>

      {timestamp && (
        <span
          className={`text-xs text-gray-400 px-1 ${
            className.includes("self-end") ? "text-right" : "text-left"
          }`}
        >
          {formatTime(timestamp)} {sender === "bot" ? "• AI" : "• You"}
        </span>
      )}
    </div>
  );
};

export default Message;
