import React from "react";
import Documents from "./Documents";
import ChatContainer from "./ChatContainer";

const LayoutChat = () => {
  return (
    // <DocumentAIChat />

    <div className="flex gap-5">
      <aside className="w-[250px] sm:w-[300px] h-auto">
        <Documents />
      </aside>

      <div className=" h-[85vh] w-[calc(100%_-_300px)]">
        <header className="bg-gray-500/30  px-3 py-5 rounded-tl-md rounded-tr-md">
          <h4>Research_Paper.Pdf</h4>
        </header>
        <ChatContainer />
      </div>
    </div>
  );
};

export default LayoutChat;
