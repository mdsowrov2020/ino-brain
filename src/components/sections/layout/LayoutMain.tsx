// LayoutMain.tsx
import Sidebar from "@/components/ui/Sidebar";
import React, { ReactNode, useState } from "react";

type LayoutMainProps = {
  children: ReactNode;
};

const LayoutMain = ({ children }: LayoutMainProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main
        className={`w-full h-screen transition-all duration-300 ${
          isSidebarOpen
            ? "sm:w-[calc(100%_-_280px)]"
            : "sm:w-[calc(100%_-_70px)]"
        }`}
      >
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
};

export default LayoutMain;
