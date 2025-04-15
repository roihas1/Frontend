import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-colors-nba-blue text-white py-4">
      <div className="container mx-auto text-center flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
        <p className="text-sm">
          © 2025 Beyond the Bracket. All rights reserved.
        </p>
        <div className="flex gap-2 text-sm">
          <Link to="/privacyPolicy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link to="/TermsOfUse" className="hover:underline">
            Terms of Use
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
