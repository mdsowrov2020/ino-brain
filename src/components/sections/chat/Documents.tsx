import React from "react";
import DocumentList from "./DocumentList";
import Button from "@/components/ui/Button";

const Documents = () => {
  return (
    <div className=" bg-gray-700/30 rounded-md p-5 h-auto">
      <DocumentList />
      <Button className="block w-full mt-5">Add documents</Button>
    </div>
  );
};

export default Documents;
