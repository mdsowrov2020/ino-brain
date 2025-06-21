import Title from "@/components/ui/Title";
import UploadDocuments from "@/features/upload-documents/UploadDocuments";
import React from "react";

const Upload = () => {
  return (
    <div>
      <header>
        <Title title="Upload Documents" />
      </header>

      <div className="mt-5">
        <UploadDocuments />
      </div>
    </div>
  );
};

export default Upload;
