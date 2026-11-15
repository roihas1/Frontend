import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SwipeableDrawer } from "@mui/material";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  glassSheetHandleClassName,
  glassSheetPaperSx,
} from "../common/glassSheet";
import { isNavPathActive, type NavItem } from "./navConfig";

interface MoreSheetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: NavItem[];
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

const MoreSheet: React.FC<MoreSheetProps> = ({
  open,
  onOpen,
  onClose,
  items,
  isLoggedIn,
  username,
  onLogout,
}) => {
  const { pathname } = useLocation();

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableSwipeToOpen
      ModalProps={{
        keepMounted: false,
      }}
      PaperProps={{
        id: "more-sheet",
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": "more-sheet-title",
        sx: glassSheetPaperSx,
      }}
    >
      <div className="flex max-h-[80dvh] flex-col">
        <div className="shrink-0 px-4 pb-2 pt-2">
          <div aria-hidden className={glassSheetHandleClassName} />
          <div className="flex items-center justify-between gap-3">
            <h2
              id="more-sheet-title"
              className="text-base font-semibold text-colors-nba-blue"
            >
              More
            </h2>
            <p className="truncate text-sm text-gray-500">
              {username || "Guest"}
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = isNavPathActive(pathname, item.to);
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors active:bg-black/5 ${
                      isActive
                        ? "bg-colors-nba-blue/10 font-semibold text-colors-nba-blue"
                        : "text-gray-800"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-colors-nba-blue text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="flex-1 text-sm">{item.mobileLabel}</span>
                    <ChevronRightIcon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-colors-nba-blue" : "text-gray-300"
                      }`}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-200/70 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={!isLoggedIn}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
            Logout
          </button>
        </div>
      </div>
    </SwipeableDrawer>
  );
};

export default MoreSheet;
