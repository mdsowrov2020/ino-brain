import React from "react";

const ReviewList = () => {
  return (
    <ul>
      <li className="flex gap-3 not-[:last-child]:mb-2">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-700 mt-[8px]"></span>{" "}
        <div>
          <h5 className="text-md">Summary of Report Q1 2024</h5>
          <summary className="text-[13px] text-gray-300">
            Review the Q1 summary
          </summary>
        </div>
      </li>
      <li className="flex gap-3 not-[:last-child]:mb-2">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-700 mt-[8px]"></span>{" "}
        <div>
          <h5 className="text-md">Note on NLP Techniques</h5>
          <summary className="text-[13px] text-gray-300">
            Consider revisiting your not on NLP for the upcoming project
          </summary>
        </div>
      </li>
    </ul>
  );
};

export default ReviewList;
