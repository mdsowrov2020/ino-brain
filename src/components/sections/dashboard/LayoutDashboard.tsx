import React from "react";
import StatCard from "./StatCard";
import Box from "./Box";
import RecentUploads from "./RecentUploads";
import ReviewList from "./ReviewList";

const LayoutDashboard = () => {
  return (
    <>
      <div className="flex gap-5 w-full">
        <StatCard count={14} title="Documents" />
        <StatCard count={32} title="Notes" />
        <StatCard count={7} title="Chats" />
      </div>

      <div className="mt-5 flex gap-5">
        <Box title="Recent uploads">
          <RecentUploads />
        </Box>
        <Box title="You might want to review">
          <ReviewList />
        </Box>
      </div>
    </>
  );
};

export default LayoutDashboard;
