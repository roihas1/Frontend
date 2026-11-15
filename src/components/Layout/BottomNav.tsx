import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../providers&context/AuthContext";
import { useUser } from "../providers&context/userContext";
import { useIsKeyboardOpen } from "../../hooks/useIsKeyboardOpen";
import { useLogout } from "../../hooks/useLogout";
import { useShowBottomNav } from "../../hooks/useShowBottomNav";
import BottomNavTab from "./BottomNavTab";
import MoreSheet from "./MoreSheet";
import {
  isMoreActive,
  isNavItemVisible,
  isNavPathActive,
  MORE_NAV_ORDER,
  NAV_ITEMS,
  TAB_NAV_ORDER,
  type NavItemId,
} from "./navConfig";

const BottomNav: React.FC = () => {
  const showBottomNav = useShowBottomNav();
  const isKeyboardOpen = useIsKeyboardOpen();
  const shouldReduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();
  const { role } = useUser();
  const { handleLogout } = useLogout();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAdmin = role === "ADMIN";
  const username = localStorage.getItem("username") ?? "";

  const visibility = useMemo(
    () => ({ isLoggedIn, isAdmin }),
    [isLoggedIn, isAdmin],
  );

  const tabItems = useMemo(
    () =>
      TAB_NAV_ORDER.map((id) => NAV_ITEMS[id]).filter((item) =>
        isNavItemVisible(item, visibility),
      ),
    [visibility],
  );

  const moreItems = useMemo(
    () =>
      MORE_NAV_ORDER.map((id) => NAV_ITEMS[id]).filter((item) =>
        isNavItemVisible(item, visibility),
      ),
    [visibility],
  );

  const activeTabId = useMemo((): NavItemId | "more" | null => {
    const matchedTab = tabItems.find((item) =>
      isNavPathActive(pathname, item.to),
    );
    if (matchedTab) {
      return matchedTab.id;
    }
    if (isMoreActive(pathname, visibility)) {
      return "more";
    }
    return null;
  }, [pathname, tabItems, visibility]);

  const bubbleTargetId = isMoreOpen ? "more" : activeTabId;

  const bubbleTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 32 };

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  const handleOpenMore = () => setIsMoreOpen(true);
  const handleCloseMore = () => setIsMoreOpen(false);

  if (!showBottomNav) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-bottom-nav flex justify-center pointer-events-none xl:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity,visibility] duration-200 ${
          isKeyboardOpen
            ? "translate-y-full opacity-0 invisible"
            : "translate-y-0 opacity-100 visible"
        }`}
      >
        <nav
          aria-label="Primary"
          className="pointer-events-auto w-full max-w-md rounded-full border border-white/40 bg-white/95 p-1.5 shadow-glass ring-1 ring-black/5 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur-2xl supports-[backdrop-filter]:backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-white/95 [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none [@media(max-height:500px)]:p-1"
        >
          <ul className="flex items-stretch gap-0.5">
            {tabItems.map((item) => (
              <li key={item.id} className="flex flex-1">
                <BottomNavTab
                  label={item.mobileLabel}
                  icon={item.icon}
                  to={item.to}
                  isActive={activeTabId === item.id}
                  isBubbleTarget={bubbleTargetId === item.id}
                  transition={bubbleTransition}
                />
              </li>
            ))}
            <li className="flex flex-1">
              <BottomNavTab
                label="More"
                icon={EllipsisHorizontalIcon}
                isActive={activeTabId === "more"}
                isBubbleTarget={bubbleTargetId === "more"}
                onClick={handleOpenMore}
                hasPopup
                isExpanded={isMoreOpen}
                controlsId="more-sheet"
                transition={bubbleTransition}
              />
            </li>
          </ul>
        </nav>
      </div>

      <MoreSheet
        open={isMoreOpen}
        onOpen={handleOpenMore}
        onClose={handleCloseMore}
        items={moreItems}
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={() => void handleLogout()}
      />
    </>
  );
};

export default BottomNav;
