import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface AccountMenuProps {
  username: string;
  isActive: boolean;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  username,
  isActive,
  isLoggedIn,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        pointerEvents: isLoggedIn ? "auto" : "none",
        opacity: isLoggedIn ? 1 : 0.5,
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.95rem] transition-colors hover:border-colors-nba-blue hover:text-colors-nba-blue focus:outline-none focus:ring-2 focus:ring-gray-300 ${
          isActive || isOpen
            ? "border-colors-nba-blue text-colors-nba-blue font-semibold"
            : "border-gray-300 text-black"
        }`}
      >
        <UserCircleIcon className="h-6 w-6" aria-hidden />
        <span className="max-w-[120px] truncate">{username || "Account"}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <Link
            to="/account"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-100"
          >
            <UserCircleIcon className="h-5 w-5" aria-hidden />
            Account
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
