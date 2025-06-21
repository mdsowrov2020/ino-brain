import React from "react";

import Button from "@/components/ui/Button";
import DocumentList from "./DocumentList";

const Documents = () => {
  return (
    <div className=" border border-gray-800/60 rounded-md p-5 h-[94vh] grid grid-rows-[1fr_auto]">
      <div className="overflow-y-auto">
        <DocumentList />
      </div>
      <div>
        <Button className="block w-full mt-5">Add documents</Button>
      </div>
    </div>
  );
};

export default Documents;
