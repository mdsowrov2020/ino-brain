import React from "react";
import Message from "./Message";

const MessageBox = () => {
  return (
    <div className="h-full w-full flex flex-col gap-3 ">
      <Message message="Hello! - User" className="self-end" />
      <Message
        message="Hey Sowrov! How can I help you ? - AI"
        className="self-start"
      />
      <Message
        message="the quick brown fox jumps right over the lazy dog - User"
        className="self-end"
      />
      <Message
        message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras posuere fermentum nisl condimentum dapibus. Sed consequat facilisis elementum. Phasellus blandit nisl non augue ultrices, nec pulvinar mi cursus. Maecenas sed mi libero. Nullam molestie commodo nunc, at semper ex efficitur ultricies. - AI"
        className="self-start"
      />
    </div>
  );
};

export default MessageBox;
