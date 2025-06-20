import React from "react";
type TitleProp = {
  title: string;
};
const Title = ({ title }: TitleProp) => {
  return (
    <h2 className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-200">
      {title}
    </h2>
  );
};

export default Title;
