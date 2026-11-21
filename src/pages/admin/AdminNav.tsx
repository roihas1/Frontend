import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Hub", end: true },
  { to: "/admin/series", label: "Series" },
  { to: "/admin/setup", label: "Setup" },
  { to: "/admin/champions", label: "Champions" },
] as const;

const AdminNav: React.FC = () => {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={"end" in link ? link.end : false}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-colors-nba-blue text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNav;
