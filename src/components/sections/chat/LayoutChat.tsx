import React from "react";
import Documents from "./Documents";
import ChatContainer from "./ChatContainer";

const LayoutChat = () => {
  return (
    <div className="flex gap-5">
      <aside className="w-[250px] sm:w-[300px] h-auto">
        <Documents />
      </aside>
      <ChatContainer />
    </div>
  );
};

export default LayoutChat;
