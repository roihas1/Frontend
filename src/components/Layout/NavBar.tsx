import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../providers&context/userContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useError, useSuccessMessage } from "../providers&context/NotificationProvider";
import Logo from "../../assets/siteLogo/logo_color_trans.png";
import Title from "../../assets/siteLogo/title_straight_shadow.png";
import NavLink from "./NavLink";
import MobileNavItem from "./MobileNavItem";
import MissingBets from "./MissinigBets";
import { useAuth } from "../providers&context/AuthContext";
import { useTournament } from "../providers&context/TournamentContext";
import { FormControl, MenuItem, Select } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  HomeIcon,
  TrophyIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  const { role, setRole } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const { isLoggedIn, logout } = useAuth();
  const { tournaments, selectedTournamentId, setSelectedTournamentId } =
    useTournament();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const username = localStorage.getItem("username") ?? "";

  const mobileNavSections = useMemo(() => {
    const baseSections: {
      label: string;
      items: {
        to: string;
        title: string;
        icon: React.ElementType;
      }[];
    }[] = [
      {
        label: "Play",
        items: [
          { to: "/home", title: "Home", icon: HomeIcon },
          { to: "/leagues", title: "Leagues", icon: TrophyIcon },
          { to: "/comparing", title: "Comparison", icon: ArrowsRightLeftIcon },
          { to: "/guess-stats", title: "Guess Stats", icon: ChartBarIcon },
        ],
      },
      {
        label: "Info",
        items: [
          { to: "/HowToPlay", title: "How to Play?", icon: BookOpenIcon },
          { to: "/AboutUs", title: "About Us", icon: UsersIcon },
        ],
      },
    ];

    if (isLoggedIn) {
      baseSections.push({
        label: "Account",
        items: [
          { to: "/account", title: "Account", icon: UserCircleIcon },
        ],
      });
    }

    if (role === "ADMIN") {
      baseSections.push({
        label: "Admin",
        items: [
          { to: "/updateBets", title: "Update Bets", icon: Cog6ToothIcon },
        ],
      });
    }

    let staggerIndex = 0;
    return baseSections.map((section) => ({
      label: section.label,
      items: section.items.map((item) => {
        const itemWithStagger = { ...item, staggerIndex };
        staggerIndex += 1;
        return itemWithStagger;
      }),
    }));
  }, [role, isLoggedIn]);

  const isActive = (path: string) => {
    const leaguesPaths = ["/leagues", "/league", "/manageLeague"];
    return (
      location.pathname === path ||
      location.pathname.startsWith(path) ||
      (leaguesPaths.includes(path) &&
        (location.pathname.startsWith("/league") ||
          location.pathname.startsWith("/manage")))
    );
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axiosInstance.patch("/auth/logout", {
        username: localStorage.getItem("username"),
      });
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status !== 401) {
        showError("Couldn't log you out.", "Try again in a moment.");
        return;
      }
      // 401 means token is already invalid; continue local logout for clean UX.
    }
    showSuccessMessage("Logged out.", "See you at tip-off!");
    logout({ reason: "manual" });
    setRole("");
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleTournamentChange = async (nextTournamentId: string) => {
    setSelectedTournamentId(nextTournamentId);
    await queryClient.invalidateQueries();
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  const renderTournamentPicker = (variant: "desktop" | "mobile" = "desktop") => {
    if (!isLoggedIn || tournaments.length === 0) {
      return null;
    }

    const isMobile = variant === "mobile";

    return (
      <FormControl size="small" sx={{ minWidth: isMobile ? 120 : 170 }}>
        <Select
          value={selectedTournamentId ?? ""}
          displayEmpty
          onChange={(event) => {
            const nextTournamentId = event.target.value;
            if (nextTournamentId) {
              void handleTournamentChange(nextTournamentId);
            }
          }}
          inputProps={{ "aria-label": "Tournament picker" }}
          sx={{
            borderRadius: "12px",
            backgroundColor: "#f3f4f6",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ...(isMobile && {
              "& .MuiSelect-select": {
                py: 0.75,
                pr: 3,
                fontSize: "0.85rem",
              },
            }),
          }}
        >
          {tournaments.map((tournament) => (
            <MenuItem key={tournament.id} value={tournament.id}>
              {tournament.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <nav className="bg-gray-100 border-b-2 shadow-md  top-0 z-30">
      <div className="max-w-screen-2xl flex items-center justify-between mx-auto px-3 py-2">
        {/* Logo and Title */}
        <Link
          to="/home"
          className="flex items-center space-x-2"
          style={{
            pointerEvents: isLoggedIn ? "auto" : "none",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
        >
          <img src={Logo} className="h-12 lg:h-14 w-auto" alt="NBA Logo" />
          <img
            src={Title}
            className="h-10 lg:h-12 w-auto hidden sm:block"
            alt="Title"
          />
        </Link>

        {/* Desktop Navigation - Unchanged */}
        <div className="hidden xl:flex gap-2 2xl:gap-3 items-center">
          <NavLink
            to="/home"
            title="Home"
            isActive={isActive("/home")}
            isLoggedIn={isLoggedIn}
          />
          <NavLink
            to="/leagues"
            title="Leagues"
            isActive={isActive("/leagues")}
            isLoggedIn={isLoggedIn}
          />
          <NavLink
            to="/comparing"
            title="Comparison"
            isActive={isActive("/comparing")}
            isLoggedIn={isLoggedIn}
          />
          <NavLink
            to="/guess-stats"
            title="Guess Stats"
            isActive={isActive("/guess-stats")}
            isLoggedIn={isLoggedIn}
          />
          {isLoggedIn && (
            <NavLink
              to="/account"
              title="Account"
              isActive={isActive("/account")}
              isLoggedIn={isLoggedIn}
            />
          )}
          <NavLink
            to="/HowToPlay"
            title="How to Play?"
            isActive={isActive("/HowToPlay")}
            isLoggedIn={isLoggedIn}
          />

          {role === "ADMIN" && (
            <NavLink
              to="/updateBets"
              title="Update Bets"
              isActive={isActive("/updateBets")}
              isLoggedIn={isLoggedIn}
            />
          )}
          <NavLink
            to="/AboutUs"
            title="About Us"
            isActive={isActive("/AboutUs")}
            isLoggedIn={isLoggedIn}
          />
          {renderTournamentPicker("desktop")}
          <MissingBets />
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 font-medium transition-colors duration-300"
              disabled={!isLoggedIn}
              style={{
                pointerEvents: isLoggedIn ? "auto" : "none",
                opacity: isLoggedIn ? 1 : 0.5,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="xl:hidden flex items-center gap-1">
          {renderTournamentPicker("mobile")}
          <MissingBets showLabel={false} />
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-7 w-7" aria-hidden />
            ) : (
              <Bars3Icon className="h-7 w-7" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer backdrop */}
      <div
        role="presentation"
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed right-0 top-0 z-40 flex h-full w-[85%] max-w-sm flex-col rounded-l-3xl bg-white shadow-2xl transition-transform duration-300 ease-out xl:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between rounded-tl-3xl bg-gradient-to-br from-colors-nba-blue to-[#0f2a5c] px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <img src={Logo} className="h-10 w-auto shrink-0" alt="" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Playoffs
              </p>
              <p className="truncate font-semibold">
                {username || "Guest"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="shrink-0 rounded-full bg-white/15 p-2 hover:bg-white/25 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {mobileNavSections.map((section) => (
            <div key={section.label} className="mb-4 last:mb-0">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 16 }}
                      animate={
                        isMenuOpen
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: 16 }
                      }
                      transition={{
                        delay: isMenuOpen ? item.staggerIndex * 0.04 : 0,
                        duration: 0.2,
                      }}
                    >
                      <MobileNavItem
                        to={item.to}
                        title={item.title}
                        icon={item.icon}
                        isActive={isActive(item.to)}
                        isLoggedIn={isLoggedIn}
                        handleClick={closeMobileMenu}
                      />
                    </motion.div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
            disabled={!isLoggedIn}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
            Logout
          </button>
        </div>
      </aside>
    </nav>
  );
};

export default Navbar;
