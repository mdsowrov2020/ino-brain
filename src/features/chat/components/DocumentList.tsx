import React from "react";

const DocumentList = () => {
  const isSelected = true;
  return (
    <ul>
      <li
        className={`${
          isSelected ? " text-green-500" : ""
        } my-1 py-1 pl-2  rounded-sm cursor-pointer`}
      >
        <span>01. Research_Paper.pdf</span>
      </li>
      <li className="my-1 py-1 pl-2  rounded-sm cursor-pointer">
        <span>02. Meeting_Notes.txt</span>
      </li>
    </ul>
  );
};

export default DocumentList;
