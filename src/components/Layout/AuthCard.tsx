import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title, description }) => (
  <div className="relative bg-gray-100 p-8 rounded-lg shadow-2xl w-full sm:w-96 z-10">
    <h2 className="text-3xl font-bold text-center text-black mb-6">{title}</h2>
    {description && <p className="text-sm text-gray-700 mb-6 text-center">{description}</p>}
    {children}
  </div>
);

export default AuthCard;
