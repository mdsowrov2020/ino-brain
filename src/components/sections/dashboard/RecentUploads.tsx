import React from "react";

const RecentUploads = () => {
  return (
    <ul>
      <li className="my-1 py-2 pl-2 pr-2   flex justify-between items-center">
        <p className="text-sm">01. Research_Paper.pdf</p>
        <span className="text-[11px] text-gray-300">Apr 24, 2024</span>
      </li>
      <li className="my-1 py-2 pl-2 pr-2  flex justify-between items-center">
        <p className="text-sm">02. Meeting_Notes.txt</p>
        <span className="text-[11px] text-gray-300">Apr 24, 2024</span>
      </li>
    </ul>
  );
};

export default RecentUploads;
