import React from "react";

const WriteMessageBox = () => {
  return (
    <div className="h-full w-full bg-gray-500/30">
      <form className="w-full h-full">
        <textarea
          name="message"
          id=""
          rows={3}
          placeholder="Type a message"
          className="w-full h-full px-5 py-6 outline-none rounded-bl-md rounded-br-md bg-transparent"
        ></textarea>
      </form>
    </div>
  );
};

export default WriteMessageBox;
