import React, { ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  size?: "small" | "medium" | "large";
  variation?: "primary" | "secondary" | "danger" | "outline";
  onClick?: () => void;
  className?: string;
};

const Button = ({
  children,
  icon,
  size = "medium",
  variation = "primary",
  onClick,
  className,
}: ButtonProps) => {
  const baseClasses = clsx(
    "border-none rounded-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer",
    {
      // Sizes
      "py-1 px-4 text-sm": size === "small",
      "py-2 px-6 text-base": size === "medium",
      "py-3 px-8 text-lg": size === "large",

      // Variations
      "bg-orange-600 text-gray-50 hover:bg-orange-700": variation === "primary",
      "bg-gray-200 text-gray-800 hover:bg-gray-300": variation === "secondary",
      "bg-red-600 text-white hover:bg-red-700": variation === "danger",
      "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100":
        variation === "outline",
    },
    className
  );

  return (
    <button className={baseClasses} onClick={onClick}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
