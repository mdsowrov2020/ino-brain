import Documents from "./Documents";
import ChatContainer from "./ChatContainer";

const LayoutChat = async () => {
  return (
    // <DocumentAIChat />

    <div className="flex gap-5">
      <aside className="w-[250px] sm:w-[300px] h-auto">
        <Documents />
      </aside>

      <div className=" h-[85vh] w-[calc(100%_-_300px)]">
        <ChatContainer />
      </div>
    </div>
  );
};

export default LayoutChat;
