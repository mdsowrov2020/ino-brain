import React from "react";

const DocumentList = () => {
  const isSelected = true;
  return (
    <ul>
      <li
        className={`${
          isSelected ? "border-2 border-green-600/50 text-green-500" : ""
        } my-1 py-2 pl-2 bg-gray-700/50 rounded-sm`}
      >
        <span>01. Research_Paper.pdf</span>
      </li>
      <li className="my-1 py-2 pl-2 bg-gray-700/50 rounded-sm">
        <span>02. Meeting_Notes.txt</span>
      </li>
    </ul>
  );
};

export default DocumentList;
