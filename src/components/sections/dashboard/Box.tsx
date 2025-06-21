import React, { ReactNode } from "react";
type BoxProps = {
  children: ReactNode;
  title: string;
};
const Box = ({ children, title }: BoxProps) => {
  return (
    <div className="p-5 border border-gray-800/60 w-full h-[300px] rounded-md">
      <header className="mb-3">
        <h5 className="text-lg">{title}</h5>
      </header>

      {children}
    </div>
  );
};

export default Box;
