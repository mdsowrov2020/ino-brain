import React from "react";
import MessageBox from "./MessageBox";
import WriteMessageBox from "./WriteMessageBox";

const ChatContainer = () => {
  return (
    <div className="rounded-md  bg-gray-700/30 h-full w-full  grid grid-rows-[1fr_80px]">
      <div className="h-full overflow-y-auto">
        <MessageBox />
      </div>
      <WriteMessageBox />
    </div>
  );
};

export default ChatContainer;
