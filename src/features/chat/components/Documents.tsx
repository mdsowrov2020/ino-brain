import React from "react";
import DocumentList from "./DocumentList";

const Documents = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/documents`, {
    cache: "no-store", // optional
  });
  const data = await res.json();

  return (
    <div className=" border border-gray-800/60 rounded-md p-5 h-[94vh] grid grid-rows-1">
      <div className="overflow-y-auto">
        <DocumentList data={data} />
      </div>
    </div>
  );
};

export default Documents;
