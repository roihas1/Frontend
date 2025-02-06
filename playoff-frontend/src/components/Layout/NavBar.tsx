import React from "react";
import { useUser } from "../providers&context/userContext";
import { useLocation, Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import axiosInstance from "../../api/axiosInstance";
import { useError } from "../providers&context/ErrorProvider";
import { useSuccessMessage } from "../providers&context/successMassageProvider";
import Logo from "../../assets/siteLogo/logo_color_trans.png";
import Cookies from "js-cookie";
import Title from "../../assets/siteLogo/title_straight_shadow.png";
import NavLink from "./NavLink";

const Navbar: React.FC = () => {
  const { role, setRole } = useUser();
  const location = useLocation(); // Get current location
  const navigate = useNavigate();
  const { showError } = useError();
  const { showSuccessMessage } = useSuccessMessage();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

  const toggleMenu = () => {
    const menu = document.getElementById("navbar-default");
    if (menu) {
      menu.classList.toggle("hidden");
    }
  };
  const handleLogout = async () => {
    try {
      await axiosInstance.patch("/auth/logout", {
        username: localStorage.getItem("username"),
      });
      showSuccessMessage("You logout, wait to see you again!");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      Cookies.remove("auth_token");
      Cookies.remove("tokenExipry");
      setRole("");
      navigate("/");
    } catch (error) {
      showError("Failed to logout.Please try again later.");
    }
  };
  const isLoggedIn = localStorage.getItem("username") ? true : false;
  return (
    <nav className=" bg-gray-100 border-gray-200 border-b-2 shadow-md sticky top-0 dark:bg-gray-900  z-20">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-0">
        {/* Logo Section */}
        <Link
          to="/home"
          className="flex items-center space-x-1 rtl:space-x-reverse"
          style={{
            pointerEvents: isLoggedIn ? "auto" : "none",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
        >
          <img src={Logo} className="h-20 rounded-md" alt="NBA Logo" />
          {/* <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"> */}
          <img src={Title} className="h-16 w-3/5" />
          {/* </span> */}
        </Link>

        {/* Hamburger Menu Button */}
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
          onClick={toggleMenu}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navigation Menu */}
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-1 mt-4 border border-gray-300 rounded-lg bg-gray-100 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-gray-100 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
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
              to="/HowToPlay"
              title="How to Play?"
              isActive={isActive("/HowtoPlay")}
              isLoggedIn={isLoggedIn}
            />

            <NavLink
              to="/comparing"
              title="Comparison"
              isActive={isActive("/comparing")}
              isLoggedIn={isLoggedIn}
            />

            {role === "ADMIN" && (
              <NavLink
                to="/updateBets"
                title="Update bets"
                isActive={isActive("/updateBets")}
                isLoggedIn={isLoggedIn}
              />
            )}
            <li>
              <button
                onClick={handleLogout}
                className="`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent transition-transform transform  md:hover:text-colors-nba-blue md:p-1 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                disabled={!isLoggedIn}
                style={{
                  pointerEvents: isLoggedIn ? "auto" : "none",
                  opacity: isLoggedIn ? 1 : 0.5,
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
