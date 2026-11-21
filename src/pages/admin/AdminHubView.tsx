import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    to: "/admin/series",
    title: "Series workbench",
    description: "Browse series by round, update results, close bets, and manage matchups.",
  },
  {
    to: "/admin/setup",
    title: "Tournament setup",
    description: "Create tournaments, playoff stages, and series.",
  },
  {
    to: "/admin/champions",
    title: "Champions close",
    description: "Close champions bets with MVP and champion team.",
  },
] as const;

const AdminHubView: React.FC = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Link
          key={section.to}
          to={section.to}
          className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-colors-nba-blue hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{section.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default AdminHubView;
