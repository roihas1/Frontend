import React from 'react';
import { Link } from "react-router-dom";

interface NavLinkProps {
  to: string;
  title: string;
  isActive: boolean;
  isLoggedIn: boolean;
  handleUserClick?: () => void; // Optional, for comparison link
}

const NavLink: React.FC<NavLinkProps> = ({ to, title, isActive, isLoggedIn, handleUserClick }) => {
  return (
    <li className='list-none'>
      <Link
        to={to}
        className={`block py-2 px-3 text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-colors-nba-blue md:p-1 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
          isActive ? "text-colors-nba-blue border-b-2 border-colors-nba-blue font-semibold" : "text-black"
        } transition-transform transform`}
        style={{ pointerEvents: isLoggedIn ? "auto" : "none", opacity: isLoggedIn ? 1 : 0.5 }}
        onClick={handleUserClick}
      >
        {title}
      </Link>
    </li>
  );
};

export default NavLink;
