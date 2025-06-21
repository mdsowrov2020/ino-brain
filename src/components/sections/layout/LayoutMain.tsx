import Sidebar from "@/components/ui/Sidebar";
import React, { ReactNode } from "react";

type LayoutMainProps = {
  children: ReactNode;
};

const LayoutMain = ({ children }: LayoutMainProps) => {
  return (
    <div className="flex ">
      <Sidebar />
      <main className="w-full sm:w-[calc(100%_-_280px)] h-screen ">
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
};

export default LayoutMain;
