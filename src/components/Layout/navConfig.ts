import type React from "react";
import {
  HomeIcon,
  TrophyIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export type NavItemId =
  | "home"
  | "leagues"
  | "comparing"
  | "guessStats"
  | "howToPlay"
  | "aboutUs"
  | "account"
  | "updateBets";

export interface NavItem {
  id: NavItemId;
  to: string;
  desktopLabel: string;
  mobileLabel: string;
  icon: React.ElementType;
  isAdminOnly?: boolean;
  requiresAuth?: boolean;
}

export const NAV_ITEMS: Record<NavItemId, NavItem> = {
  home: {
    id: "home",
    to: "/home",
    desktopLabel: "Home",
    mobileLabel: "Home",
    icon: HomeIcon,
  },
  leagues: {
    id: "leagues",
    to: "/leagues",
    desktopLabel: "Leagues",
    mobileLabel: "Leagues",
    icon: TrophyIcon,
  },
  comparing: {
    id: "comparing",
    to: "/comparing",
    desktopLabel: "Comparison",
    mobileLabel: "Compare",
    icon: ArrowsRightLeftIcon,
  },
  guessStats: {
    id: "guessStats",
    to: "/guess-stats",
    desktopLabel: "Guess Stats",
    mobileLabel: "Stats",
    icon: ChartBarIcon,
  },
  howToPlay: {
    id: "howToPlay",
    to: "/HowToPlay",
    desktopLabel: "How to Play?",
    mobileLabel: "How to Play",
    icon: BookOpenIcon,
  },
  aboutUs: {
    id: "aboutUs",
    to: "/AboutUs",
    desktopLabel: "About Us",
    mobileLabel: "About Us",
    icon: UsersIcon,
  },
  account: {
    id: "account",
    to: "/account",
    desktopLabel: "Account",
    mobileLabel: "Account",
    icon: UserCircleIcon,
    requiresAuth: true,
  },
  updateBets: {
    id: "updateBets",
    to: "/admin",
    desktopLabel: "Admin",
    mobileLabel: "Admin",
    icon: Cog6ToothIcon,
    isAdminOnly: true,
  },
};

export const DESKTOP_NAV_ORDER: NavItemId[] = [
  "home",
  "leagues",
  "comparing",
  "guessStats",
  "howToPlay",
  "updateBets",
  "aboutUs",
];

export const TAB_NAV_ORDER: NavItemId[] = [
  "home",
  "leagues",
  "comparing",
  "guessStats",
];

export const MORE_NAV_ORDER: NavItemId[] = [
  "account",
  "howToPlay",
  "aboutUs",
  "updateBets",
];

export const HIDDEN_BOTTOM_NAV_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/redirect",
];

interface VisibilityContext {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export const isNavItemVisible = (
  item: NavItem,
  { isLoggedIn, isAdmin }: VisibilityContext,
): boolean => {
  if (item.requiresAuth && !isLoggedIn) {
    return false;
  }
  if (item.isAdminOnly && !isAdmin) {
    return false;
  }
  return true;
};

export const isNavPathActive = (pathname: string, to: string): boolean => {
  const current = pathname.toLowerCase();
  const target = to.toLowerCase();
  const leaguesPaths = ["/leagues", "/league", "/manageleague"];

  return (
    current === target ||
    current.startsWith(target) ||
    (leaguesPaths.includes(target) &&
      (current.startsWith("/league") || current.startsWith("/manage")))
  );
};

export const isMoreActive = (
  pathname: string,
  { isLoggedIn, isAdmin }: VisibilityContext,
): boolean => {
  return MORE_NAV_ORDER.some((id) => {
    const item = NAV_ITEMS[id];
    if (!isNavItemVisible(item, { isLoggedIn, isAdmin })) {
      return false;
    }
    return isNavPathActive(pathname, item.to);
  });
};
