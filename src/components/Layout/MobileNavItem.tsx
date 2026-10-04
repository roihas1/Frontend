import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface MobileNavItemProps {
  to: string;
  title: string;
  icon: React.ElementType;
  isActive: boolean;
  isLoggedIn: boolean;
  handleClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  to,
  title,
  icon: Icon,
  isActive,
  isLoggedIn,
  handleClick,
}) => {
  return (
    <Link
      to={to}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-colors-nba-blue/10 text-colors-nba-blue font-semibold"
          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      } ${!isLoggedIn ? "pointer-events-none opacity-50" : ""}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isActive ? "bg-colors-nba-blue text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="flex-1">{title}</span>
      <ChevronRightIcon
        className={`h-4 w-4 shrink-0 ${
          isActive ? "text-colors-nba-blue" : "text-gray-300"
        }`}
        aria-hidden
      />
    </Link>
  );
};

export default MobileNavItem;
