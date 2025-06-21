import React from "react";
import MessageBox from "./MessageBox";
import WriteMessageBox from "./WriteMessageBox";

const ChatContainer = () => {
  return (
    <div className="rounded-md p-5 bg-gray-700/30 h-[95vh] w-[calc(100%_-_300px)] grid grid-rows-[1fr_80px] gap-10">
      <MessageBox />
      <WriteMessageBox />
    </div>
  );
};

export default ChatContainer;
