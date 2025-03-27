import React, { useState } from "react";
import { useUser } from "../providers&context/userContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useError } from "../providers&context/ErrorProvider";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import Logo from "../../assets/siteLogo/logo_color_trans.png";
import Title from "../../assets/siteLogo/title_straight_shadow.png";
import NavLink from "./NavLink";
import MissingBets from "./MissinigBets";
import { useAuth } from "../providers&context/AuthContext";

const Navbar: React.FC = () => {
  const { role, setRole } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await axiosInstance.patch("/auth/logout", {
        username: localStorage.getItem("username"),
      });
      showSuccessMessage("You logged out, see you again!");
      logout();
      setRole("");
      navigate("/");
    } catch (error) {
      showError("Failed to log out. Please try again later.");
    }
  };

  return (
    <nav className="bg-gray-100 border-b-2 shadow-md  top-0 z-30">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 py-2">
        {/* Logo and Title */}
        <Link
          to="/home"
          className="flex items-center space-x-2"
          style={{
            pointerEvents: isLoggedIn ? "auto" : "none",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
        >
          <img src={Logo} className="h-14 w-auto" alt="NBA Logo" />
          <img
            src={Title}
            className="h-12 w-auto hidden sm:block"
            alt="Title"
          />
        </Link>

        {/* Desktop Navigation - Unchanged */}
        <div className="hidden md:flex space-x-8 items-center">
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
            to="/HowToPlay"
            title="How to Play?"
            isActive={isActive("/HowToPlay")}
            isLoggedIn={isLoggedIn}
          />
          <MissingBets />

          {role === "ADMIN" && (
            <NavLink
              to="/updateBets"
              title="Update Bets"
              isActive={isActive("/updateBets")}
              isLoggedIn={isLoggedIn}
            />
          )}

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
        <button
          className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation - Slide-in Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex flex-col h-full p-6 space-y-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="self-end text-gray-600 text-2xl hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <NavLink
            to="/home"
            title="🏠 Home"
            isActive={isActive("/home")}
            isLoggedIn={isLoggedIn}
            handleUserClick={() => setIsMenuOpen(false)}
          />
          <NavLink
            to="/leagues"
            title="🏆 Leagues"
            isActive={isActive("/leagues")}
            isLoggedIn={isLoggedIn}
            handleUserClick={() => setIsMenuOpen(false)}
          />
          <NavLink
            to="/comparing"
            title="🔍 Comparison"
            isActive={isActive("/comparing")}
            isLoggedIn={isLoggedIn}
            handleUserClick={() => setIsMenuOpen(false)}
          />
          <NavLink
            to="/HowToPlay"
            title="📖 How to Play?"
            isActive={isActive("/HowToPlay")}
            isLoggedIn={isLoggedIn}
            handleUserClick={() => setIsMenuOpen(false)}
          />
          <MissingBets />

          {role === "ADMIN" && (
            <NavLink
              to="/updateBets"
              title="⚙️ Update Bets"
              isActive={isActive("/updateBets")}
              isLoggedIn={isLoggedIn}
              handleUserClick={() => setIsMenuOpen(false)}
            />
          )}

          <button
            onClick={handleLogout}
            className="text-red-500 text-lg font-bold hover:text-red-700"
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
    </nav>
  );
};

export default Navbar;
