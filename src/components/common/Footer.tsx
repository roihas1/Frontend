import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200/70 bg-transparent py-3 text-gray-500 xl:border-0 xl:bg-colors-nba-blue xl:py-4 xl:text-white">
      <div className="container mx-auto flex flex-col items-center justify-center gap-1.5 px-4 text-center md:flex-row md:gap-4">
        <p className="text-xs xl:text-sm">
          © 2025 Beyond the Bracket. All rights reserved.
        </p>
        <div className="flex gap-2 text-xs xl:text-sm">
          <Link
            to="/privacyPolicy"
            className="transition-colors hover:text-colors-nba-blue hover:underline xl:hover:text-white"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300 xl:text-white/50" aria-hidden>
            |
          </span>
          <Link
            to="/TermsOfUse"
            className="transition-colors hover:text-colors-nba-blue hover:underline xl:hover:text-white"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
