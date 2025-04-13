import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title, description }) => (
  <div className="relative bg-gray-100 p-8 rounded-lg  w-full sm:w-3/5 z-10">
    <h2 className="text-3xl font-bold text-center text-black mb-6">{title}</h2>
    {description && <p className="text-sm text-gray-700 mb-6 text-center">{description}</p>}
    {children}
  </div>
);

export default AuthCard;
