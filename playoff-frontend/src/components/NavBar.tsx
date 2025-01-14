import React from "react";
import NBAlogo from "../assets/NBALogo.jpg";
import { useUser } from "./userContext";
import { useLocation, Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import axiosInstance from "../api/axiosInstance";
import { useError } from "./ErrorProvider";
import { useSuccessMessage } from "./successMassageProvider";

const Navbar: React.FC = () => {
  const { role, setRole} = useUser();
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
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      setRole('');
      navigate("/");
    } catch (error) {
      showError("Failed to logout.Please try again later.");
    }
  };
  const isLoggedIn = localStorage.getItem('username') ? true: false
  return (
    <nav className="bg-gray-100 border-gray-200 dark:bg-gray-900 relative z-20">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo Section */}
        <Link
          to="/home"
          className="flex items-center space-x-1 rtl:space-x-reverse"
          style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
        >
          <img src={NBAlogo} className="h-8 rounded-md" alt="NBA Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            NBA Playoffs
          </span>
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
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-100 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-gray-100 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li >
              <Link
                to="/home"
                className={`block py-2 px-3 rounded md:bg-transparent hover:text-colors-nba-blue md:p-0 dark:text-white md:dark:text-blue-500 ${
                  isActive("/home")
                    ? "text-colors-nba-blue border-b-2 border-colors-nba-blue font-semibold"
                    : "text-gray-900"
                } transition-transform transform hover:scale-105 duration-300 ease-in-out`}
                aria-current="page"
                style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/leagues"
                className={`block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent  md:hover:text-colors-nba-blue md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
                  isActive("/leagues")
                    ? "text-colors-nba-blue border-b-2 border-colors-nba-blue font-semibold"
                    : "text-gray-900"
                } transition-transform transform hover:scale-105 duration-300 ease-in-out`}
                style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
              >
                Leagues
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent  md:hover:text-colors-nba-blue md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
                  isActive("/about")
                    ? "text-colors-nba-blue border-b-2 border-colors-nba-blue font-semibold"
                    : "text-gray-900"
                } transition-transform transform hover:scale-105 duration-300 ease-in-out`}
                style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
              >
                About
              </Link>
            </li>
            {role === "ADMIN" && (
              <li className= 'hover:bg-slate-200 hover:opacity-95 rounded-lg'>
                <Link
                  to="/updateBets"
                  className={`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent  md:hover:text-colors-nba-blue md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
                    isActive("/updateBets")
                      ? "text-colors-nba-blue border-b-2 border-colors-nba-blue font-semibold"
                      : "text-gray-900"
                  } `}
                  style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
                >
                  Update bets
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent transition-transform transform hover:scale-105 duration-300 ease-in-out  md:hover:text-colors-nba-blue md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                disabled ={!isLoggedIn}
                style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
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
