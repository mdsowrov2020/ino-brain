import Title from "@/components/ui/Title";
import UploadFile from "@/components/ui/UploadFile";
import React from "react";

const Upload = () => {
  return (
    <div>
      <header>
        <Title title="Upload Documents" />
      </header>

      <div className="mt-5">
        <UploadFile />
      </div>
    </div>
  );
};

export default Upload;
