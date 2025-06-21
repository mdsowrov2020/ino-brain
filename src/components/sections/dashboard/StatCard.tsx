import React from "react";

type StatProps = {
  count: number;
  title: string;
};
const StatCard = ({ count, title }: StatProps) => {
  return (
    <div className=" rounded-md border border-gray-800/60 p-6 w-full h-[150px] flex items-center">
      <div>
        <h2 className="text-5xl text-gray-100 font-medium">{count}</h2>
        <p className="text-md text-gray-400">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
