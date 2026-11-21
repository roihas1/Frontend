import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./admin/AdminNav";

const AdminPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
      <h1 className="mb-4 text-center text-3xl font-bold">Admin</h1>
      <AdminNav />
      <Outlet />
    </div>
  );
};

export default AdminPage;
