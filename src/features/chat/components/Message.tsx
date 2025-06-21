import React from "react";

type MessageProps = {
  message: string;
  className?: string;
};
const Message = ({ message, className }: MessageProps) => {
  return (
    <p
      className={`${className} inline-block  p-4 rounded-2xl bg-gray-700/70 text-gray-300 max-w-[70%]`}
    >
      {message}
    </p>
  );
};

export default Message;
