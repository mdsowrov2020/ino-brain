"use client";
import React, { useRef, useEffect } from "react";
import { Send } from "lucide-react"; // Optional: for send icon

const WriteMessageBox = ({
  input,
  setInput,
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 120); // Max height 120px
      textarea.style.height = `${scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && input.trim()) {
      onSendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="p-4 border-t border-gray-600/50 bg-gray-800/20">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full resize-none rounded-xl px-4 py-3 pr-12
              bg-gray-800/80 text-white border border-gray-600/50
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
              placeholder-gray-400 text-sm leading-relaxed
              transition-all duration-200
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-gray-500/50"
              }
            `}
            rows={1}
            style={{
              minHeight: "48px",
              maxHeight: "120px",
              scrollbarWidth: "thin",
              scrollbarColor: "#4B5563 #374151",
            }}
          />

          {/* Character counter (optional) */}
          {input.length > 0 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-500">
              {input.length}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`
            flex items-center justify-center
            min-w-[48px] h-12 rounded-xl font-medium 
            transition-all duration-200 transform
            ${
              disabled || !input.trim()
                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
            }
          `}
          title={disabled ? "Cannot send message" : "Send message (Enter)"}
        >
          {disabled && input.trim() ? (
            // Loading spinner
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            // Send icon or text
            <Send size={18} className="ml-0.5" />
          )}
        </button>
      </form>

      {/* Status indicators */}
    </div>
  );
};

export default WriteMessageBox;
