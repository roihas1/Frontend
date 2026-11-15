import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/siteLogo/logo_color_trans.png";
import Title from "../../assets/siteLogo/title_straight_shadow.png";
import NavLink from "./NavLink";
import AccountMenu from "./AccountMenu";
import MissingBets from "./MissinigBets";
import TournamentPickerChip from "./TournamentPickerChip";
import { useAuth } from "../providers&context/AuthContext";
import { useTournament } from "../providers&context/TournamentContext";
import { useUser } from "../providers&context/userContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "../../hooks/useLogout";
import {
  DESKTOP_NAV_ORDER,
  isNavItemVisible,
  isNavPathActive,
  NAV_ITEMS,
} from "./navConfig";

const Navbar: React.FC = () => {
  const { role } = useUser();
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();
  const { tournaments, selectedTournamentId, setSelectedTournamentId } =
    useTournament();
  const queryClient = useQueryClient();
  const { handleLogout } = useLogout();
  const username = localStorage.getItem("username") ?? "";
  const isAdmin = role === "ADMIN";

  const handleTournamentChange = async (nextTournamentId: string) => {
    setSelectedTournamentId(nextTournamentId);
    await queryClient.invalidateQueries();
  };

  const renderTournamentPicker = (variant: "desktop" | "mobile") => {
    if (!isLoggedIn || tournaments.length === 0) {
      return null;
    }

    return (
      <TournamentPickerChip
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId}
        onSelect={(tournamentId) => {
          void handleTournamentChange(tournamentId);
        }}
        size={variant === "desktop" ? "desktop" : "mobile"}
      />
    );
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-3 py-2">
        <Link
          to="/home"
          className="flex items-center space-x-2"
          style={{
            pointerEvents: isLoggedIn ? "auto" : "none",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
        >
          <img src={Logo} className="h-12 w-auto lg:h-14" alt="NBA Logo" />
          <img
            src={Title}
            className="hidden h-10 w-auto sm:block lg:h-12"
            alt="Title"
          />
        </Link>

        <div className="hidden items-center gap-2 xl:flex 2xl:gap-3">
          {DESKTOP_NAV_ORDER.map((id) => {
            const item = NAV_ITEMS[id];
            if (!isNavItemVisible(item, { isLoggedIn, isAdmin })) {
              return null;
            }
            return (
              <NavLink
                key={item.id}
                to={item.to}
                title={item.desktopLabel}
                isActive={isNavPathActive(pathname, item.to)}
                isLoggedIn={isLoggedIn}
              />
            );
          })}
          {renderTournamentPicker("desktop")}
          <MissingBets />
          <AccountMenu
            username={username}
            isActive={isNavPathActive(pathname, "/account")}
            isLoggedIn={isLoggedIn}
            onLogout={() => void handleLogout()}
          />
        </div>

        <div className="flex items-center gap-0.5 xl:hidden">
          {renderTournamentPicker("mobile")}
          <MissingBets showLabel={false} compact />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
